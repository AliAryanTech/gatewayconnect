import type { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'node:crypto';

type VercelRequest = IncomingMessage & { method?: string };

function json(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function getParam(params: URLSearchParams, name: string): string {
  const wanted = name.toLowerCase();
  for (const [key, value] of params.entries()) if (key.toLowerCase() === wanted) return value;
  return '';
}

function verifyHash(params: URLSearchParams, key: string): boolean {
  const supplied = getParam(params, 'hash');
  if (!supplied || !key) return false;
  const values: string[] = [];
  for (const [name, value] of params.entries()) if (name.toLowerCase() !== 'hash') values.push(value);
  const expected = crypto.createHash('sha512').update(values.join('') + key, 'utf8').digest('hex').toUpperCase();
  const a = Buffer.from(supplied.toUpperCase(), 'utf8');
  const b = Buffer.from(expected, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async function handler(req: VercelRequest, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || process.env.VITE_APP_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'GET') {
    json(res, 405, { success: false, error: 'Method not allowed.' });
    return;
  }

  const reqUrl = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);
  const pollUrl = reqUrl.searchParams.get('url');
  const integrationKey = String(process.env.PAYNOW_INTEGRATION_KEY || '').trim();

  if (!integrationKey) {
    json(res, 503, { success: false, error: 'Paynow is not configured on the server.' });
    return;
  }
  if (!pollUrl) {
    json(res, 400, { success: false, error: 'Missing Paynow poll URL.' });
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(pollUrl);
  } catch {
    json(res, 400, { success: false, error: 'Invalid Paynow poll URL.' });
    return;
  }
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'www.paynow.co.zw') {
    json(res, 400, { success: false, error: 'Invalid Paynow poll URL.' });
    return;
  }

  try {
    // Paynow's API specifies an empty POST for polling, not a GET.
    const response = await fetch(parsed.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: '',
      signal: AbortSignal.timeout(20_000)
    });
    const params = new URLSearchParams(await response.text());

    if (!response.ok) {
      json(res, 502, { success: false, error: getParam(params, 'error') || `Paynow returned HTTP ${response.status}.` });
      return;
    }
    if (!verifyHash(params, integrationKey)) {
      json(res, 502, { success: false, error: 'Paynow returned an invalid status signature.' });
      return;
    }

    const status = getParam(params, 'status') || 'Created';
    const amount = Number.parseFloat(getParam(params, 'amount') || '0') || 0;
    json(res, 200, {
      success: true,
      status,
      reference: getParam(params, 'reference'),
      amount,
      paynowReference: getParam(params, 'paynowreference') || undefined,
      pollUrl: getParam(params, 'pollurl') || undefined,
      isPaid: ['paid', 'awaiting delivery', 'delivered'].includes(status.toLowerCase())
    });
  } catch (error) {
    json(res, 502, { success: false, error: error instanceof Error ? error.message : 'Unable to poll Paynow.' });
  }
}
