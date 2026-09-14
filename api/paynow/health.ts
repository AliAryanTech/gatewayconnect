import type { IncomingMessage, ServerResponse } from 'node:http';

export default function handler(req: IncomingMessage & { method?: string }, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || process.env.VITE_APP_URL || '*');

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end(JSON.stringify({ success: false, error: 'Method not allowed.' }));
    return;
  }

  const integrationId = String(process.env.PAYNOW_INTEGRATION_ID || '').trim();
  const integrationKey = String(process.env.PAYNOW_INTEGRATION_KEY || '').trim();
  const merchantEmail = String(process.env.PAYNOW_MERCHANT_EMAIL || '').trim();

  res.statusCode = 200;
  res.end(JSON.stringify({
    success: true,
    configured: Boolean(integrationId && integrationKey),
    integrationId: integrationId || undefined,
    merchantEmail: merchantEmail || undefined
  }));
}
