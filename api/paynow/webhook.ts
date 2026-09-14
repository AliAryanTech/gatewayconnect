import type { IncomingMessage, ServerResponse } from 'node:http';

type VercelRequest = IncomingMessage & {
  body?: any;
  query?: Record<string, string | string[]>;
  method?: string;
};

type VercelResponse = ServerResponse & {
  status: (statusCode: number) => VercelResponse;
  json: (body: any) => void;
  send: (body: any) => void;
};

/**
 * Paynow result URL endpoint.
 * Paynow expects a successful HTTP response after delivering the transaction
 * result. The frontend separately polls the supplied poll URL, so this route
 * intentionally does not mark a payment as paid by itself.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
    return;
  }

  // Acknowledge Paynow's result notification. Do not trust the callback alone
  // as proof of payment; payment status is verified through the poll endpoint.
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('OK');
}
