import type { IncomingMessage, ServerResponse } from 'node:http';
import { CONFIG } from '../../config';

export default function handler(req: IncomingMessage & { method?: string }, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', CONFIG.APP_URL || '*');

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end(JSON.stringify({ success: false, error: 'Method not allowed.' }));
    return;
  }

  const integrationId = CONFIG.PAYNOW_INTEGRATION_ID;
  const integrationKey = CONFIG.PAYNOW_INTEGRATION_KEY;
  const merchantEmail = CONFIG.PAYNOW_MERCHANT_EMAIL;

  res.statusCode = 200;
  res.end(JSON.stringify({
    success: true,
    configured: Boolean(integrationId && integrationKey),
    integrationId: integrationId || undefined,
    merchantEmail: merchantEmail || undefined
  }));
}
