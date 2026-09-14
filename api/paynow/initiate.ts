import type { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'node:crypto';

type RequestBody = Record<string, unknown>;

type VercelRequest = IncomingMessage & {
  body?: RequestBody | string;
  method?: string;
};

type VercelResponse = ServerResponse;

const PAYNOW_INITIATE_URL = 'https://www.paynow.co.zw/interface/initiatetransaction';
const PAYNOW_REMOTE_URL = 'https://www.paynow.co.zw/interface/remotetransaction';
const ALLOWED_REMOTE_METHODS = new Set(['ecocash', 'onemoney']);

function json(res: VercelResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

async function readBody(req: VercelRequest): Promise<RequestBody> {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as RequestBody;
    } catch {
      return {};
    }
  }

  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 64 * 1024) reject(new Error('Request body too large.'));
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body) as RequestBody);
      } catch {
        reject(new Error('Invalid JSON request body.'));
      }
    });
    req.on('error', reject);
  });
}

function sha512(values: string[], integrationKey: string): string {
  return crypto.createHash('sha512').update(values.join('') + integrationKey, 'utf8').digest('hex').toUpperCase();
}

function getParam(params: URLSearchParams, name: string): string {
  const wanted = name.toLowerCase();
  for (const [key, value] of params.entries()) {
    if (key.toLowerCase() === wanted) return value;
  }
  return '';
}

function verifyResponseHash(params: URLSearchParams, integrationKey: string): boolean {
  const suppliedHash = getParam(params, 'hash');
  if (!suppliedHash) return false;
  const values: string[] = [];
  for (const [key, value] of params.entries()) {
    if (key.toLowerCase() !== 'hash') values.push(value);
  }
  const expected = sha512(values, integrationKey);
  const a = Buffer.from(suppliedHash.toUpperCase(), 'utf8');
  const b = Buffer.from(expected, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function normalizeZimbabweMobile(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('263') && digits.length === 12 && digits[3] === '7') return `0${digits.slice(3)}`;
  if (digits.startsWith('07') && digits.length === 10) return digits;
  throw new Error('EcoCash/OneMoney requires a valid Zimbabwe mobile number, for example 0771234567 or +263771234567.');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = process.env.APP_URL || process.env.VITE_APP_URL || '';
  res.setHeader('Access-Control-Allow-Origin', origin ? origin.replace(/\/$/, '') : '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'POST') {
    json(res, 405, { success: false, error: 'Method not allowed.' });
    return;
  }

  try {
    const body = await readBody(req);
    const integrationId = String(process.env.PAYNOW_INTEGRATION_ID || '').trim();
    const integrationKey = String(process.env.PAYNOW_INTEGRATION_KEY || '').trim();
    const merchantEmail = String(process.env.PAYNOW_MERCHANT_EMAIL || '').trim();
    const appUrl = String(process.env.APP_URL || process.env.VITE_APP_URL || 'https://gatewayconnect.joedaniels.org').replace(/\/$/, '');

    if (!integrationId || !integrationKey) {
      json(res, 503, {
        success: false,
        error: 'Paynow is not configured on the server. Add PAYNOW_INTEGRATION_ID and PAYNOW_INTEGRATION_KEY in Vercel Environment Variables.'
      });
      return;
    }

    const reference = String(body.reference || '').trim();
    const amountNumber = Number(body.amount);
    const additionalInfo = String(body.additionalInfo || 'Gateway Church Ministry').trim().slice(0, 255);
    const method = String(body.method || '').trim().toLowerCase();

    if (!reference || reference.length > 100) {
      json(res, 400, { success: false, error: 'A valid unique payment reference is required.' });
      return;
    }
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      json(res, 400, { success: false, error: 'Payment amount must be greater than zero.' });
      return;
    }

    const amount = amountNumber.toFixed(2);
    const returnUrl = String(process.env.PAYNOW_RETURN_URL || `${appUrl}/?payment=return`).trim();
    const resultUrl = String(process.env.PAYNOW_RESULT_URL || `${appUrl}/api/paynow/webhook`).trim();
    const authEmail = merchantEmail || undefined;
    const isRemote = ALLOWED_REMOTE_METHODS.has(method);

    let phone = '';
    if (isRemote) {
      phone = normalizeZimbabweMobile(String(body.phone || '').trim());
    }

    const params = new URLSearchParams();
    if (isRemote) {
      // Paynow's Express Checkout hash uses the fields in the request order.
      params.set('method', method);
      params.set('phone', phone);
    }
    params.set('id', integrationId);
    params.set('reference', reference);
    params.set('amount', amount);
    params.set('additionalinfo', additionalInfo);
    params.set('returnurl', returnUrl);
    params.set('resulturl', resultUrl);
    if (authEmail) params.set('authemail', authEmail);
    params.set('status', 'Message');

    const hashValues = Array.from(params.entries()).map(([, value]) => value);
    params.set('hash', sha512(hashValues, integrationKey));

    const endpoint = isRemote ? PAYNOW_REMOTE_URL : PAYNOW_INITIATE_URL;
    const paynowResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      signal: AbortSignal.timeout(20_000)
    });

    const raw = await paynowResponse.text();
    const result = new URLSearchParams(raw);
    const status = getParam(result, 'status').toLowerCase();

    if (!paynowResponse.ok) {
      json(res, 502, { success: false, error: getParam(result, 'error') || `Paynow returned HTTP ${paynowResponse.status}.` });
      return;
    }

    if (status !== 'ok' && status !== 'success' && status !== 'paid' && status !== 'awaiting delivery' && status !== 'delivered') {
      json(res, 200, {
        success: false,
        reference,
        error: getParam(result, 'error') || 'Paynow rejected the transaction.'
      });
      return;
    }

    if (!verifyResponseHash(result, integrationKey)) {
      json(res, 502, { success: false, reference, error: 'Paynow returned an invalid response signature. The payment was not accepted.' });
      return;
    }

    json(res, 200, {
      success: true,
      reference,
      browserUrl: getParam(result, 'browserurl') || undefined,
      pollUrl: getParam(result, 'pollurl') || undefined,
      instructions: getParam(result, 'instructions') || (isRemote
        ? `Payment request sent to ${phone}. Check the customer's phone for the EcoCash/OneMoney authorization prompt.`
        : 'Payment session initialized. Continue in the Paynow checkout.')
    });
  } catch (error) {
    json(res, 502, {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to reach Paynow. No payment was recorded.'
    });
  }
}
