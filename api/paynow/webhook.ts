import type { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'node:crypto';

type VercelRequest = IncomingMessage & { body?: Record<string, unknown> | string; method?: string };

function json(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

async function readBody(req: VercelRequest): Promise<Record<string, string>> {
  if (req.body && typeof req.body === 'object') {
    return Object.fromEntries(Object.entries(req.body).map(([k, v]) => [k, String(v ?? '')]));
  }
  if (typeof req.body === 'string') return Object.fromEntries(new URLSearchParams(req.body).entries());
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 64 * 1024) reject(new Error('Payload too large.'));
    });
    req.on('end', () => resolve(Object.fromEntries(new URLSearchParams(body).entries())));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: ServerResponse) {
  if (req.method !== 'POST') {
    json(res, 405, { success: false, error: 'Method not allowed.' });
    return;
  }

  try {
    const key = String(process.env.PAYNOW_INTEGRATION_KEY || '').trim();
    if (!key) {
      json(res, 503, { success: false, error: 'Paynow is not configured on the server.' });
      return;
    }

    const data = await readBody(req);
    const suppliedHash = data.hash || data.Hash || '';
    if (!suppliedHash) {
      json(res, 400, { success: false, error: 'Missing Paynow response hash.' });
      return;
    }

    const values = Object.entries(data)
      .filter(([name]) => name.toLowerCase() !== 'hash')
      .map(([, value]) => value);
    const expected = crypto.createHash('sha512').update(values.join('') + key, 'utf8').digest('hex').toUpperCase();
    const a = Buffer.from(suppliedHash.toUpperCase(), 'utf8');
    const b = Buffer.from(expected, 'utf8');

    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      json(res, 400, { success: false, error: 'Invalid Paynow response signature.' });
      return;
    }

    // The browser polls Paynow and updates its local order/donation state.
    // This endpoint deliberately does not expose the integration key or other secrets.
    json(res, 200, {
      success: true,
      reference: data.reference || '',
      status: data.status || ''
    });
  } catch (error) {
    json(res, 400, { success: false, error: error instanceof Error ? error.message : 'Invalid Paynow callback.' });
  }
}
