import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import crypto from 'node:crypto';
import { defineConfig, loadEnv } from 'vite';

const PAYNOW_INITIATE_URL = 'https://www.paynow.co.zw/interface/initiatetransaction';
const PAYNOW_REMOTE_URL = 'https://www.paynow.co.zw/interface/remotetransaction';
const PAYNOW_HOST = 'www.paynow.co.zw';

function hashValues(values: string[], key: string): string {
  return crypto.createHash('sha512').update(values.join('') + key, 'utf8').digest('hex').toUpperCase();
}

function getParam(params: URLSearchParams, name: string): string {
  const wanted = name.toLowerCase();
  for (const [key, value] of params.entries()) if (key.toLowerCase() === wanted) return value;
  return '';
}

function verifyHash(params: URLSearchParams, key: string): boolean {
  const supplied = getParam(params, 'hash');
  if (!supplied) return false;
  const values: string[] = [];
  for (const [name, value] of params.entries()) if (name.toLowerCase() !== 'hash') values.push(value);
  const expected = hashValues(values, key);
  return supplied.toUpperCase() === expected;
}

function normalizeZimbabweMobile(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('263') && digits.length === 12 && digits[3] === '7') return `0${digits.slice(3)}`;
  if (digits.startsWith('07') && digits.length === 10) return digits;
  throw new Error('EcoCash/OneMoney requires a Zimbabwe mobile number, e.g. 0771234567 or +263771234567.');
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const appUrl = (env.APP_URL || env.VITE_APP_URL || 'http://localhost:3000').replace(/\/$/, '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'paynow-api-middleware',
        configureServer(server: any) {
          server.middlewares.use('/api/paynow/initiate', async (req: any, res: any) => {
            if (req.method === 'OPTIONS') {
              res.statusCode = 204;
              res.end();
              return;
            }
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Method not allowed.' }));
              return;
            }

            let body = '';
            req.on('data', (chunk: any) => { body += chunk.toString(); });
            req.on('end', async () => {
              res.setHeader('Content-Type', 'application/json');
              try {
                const input = JSON.parse(body || '{}');
                const integrationId = String(env.PAYNOW_INTEGRATION_ID || '').trim();
                const integrationKey = String(env.PAYNOW_INTEGRATION_KEY || '').trim();
                const merchantEmail = String(env.PAYNOW_MERCHANT_EMAIL || '').trim();

                if (!integrationId || !integrationKey) {
                  res.statusCode = 503;
                  res.end(JSON.stringify({ success: false, error: 'Paynow is not configured. Add PAYNOW_INTEGRATION_ID and PAYNOW_INTEGRATION_KEY to .env.local.' }));
                  return;
                }

                const reference = String(input.reference || '').trim();
                const amountNumber = Number(input.amount);
                const method = String(input.method || '').trim().toLowerCase();
                const isRemote = method === 'ecocash' || method === 'onemoney';
                const amount = amountNumber.toFixed(2);
                const returnUrl = String(env.PAYNOW_RETURN_URL || `${appUrl}/?payment=return`);
                const resultUrl = String(env.PAYNOW_RESULT_URL || `${appUrl}/api/paynow/webhook`);
                const additionalInfo = String(input.additionalInfo || 'Gateway Church Ministry').trim().slice(0, 255);

                if (!reference || !Number.isFinite(amountNumber) || amountNumber <= 0) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ success: false, error: 'A valid reference and positive amount are required.' }));
                  return;
                }

                const params = new URLSearchParams();
                if (isRemote) {
                  params.set('method', method);
                  params.set('phone', normalizeZimbabweMobile(String(input.phone || '')));
                }
                params.set('id', integrationId);
                params.set('reference', reference);
                params.set('amount', amount);
                params.set('additionalinfo', additionalInfo);
                params.set('returnurl', returnUrl);
                params.set('resulturl', resultUrl);
                if (merchantEmail) params.set('authemail', merchantEmail);
                params.set('status', 'Message');
                params.set('hash', hashValues(Array.from(params.values()), integrationKey));

                const response = await fetch(isRemote ? PAYNOW_REMOTE_URL : PAYNOW_INITIATE_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: params.toString(),
                  signal: AbortSignal.timeout(20000)
                });
                const result = new URLSearchParams(await response.text());
                const status = getParam(result, 'status').toLowerCase();

                if (!response.ok || status !== 'ok') {
                  res.statusCode = response.ok ? 200 : 502;
                  res.end(JSON.stringify({ success: false, reference, error: getParam(result, 'error') || `Paynow returned HTTP ${response.status}.` }));
                  return;
                }
                if (!verifyHash(result, integrationKey)) {
                  res.statusCode = 502;
                  res.end(JSON.stringify({ success: false, reference, error: 'Invalid Paynow response signature.' }));
                  return;
                }

                res.statusCode = 200;
                res.end(JSON.stringify({
                  success: true,
                  reference,
                  browserUrl: getParam(result, 'browserurl') || undefined,
                  pollUrl: getParam(result, 'pollurl') || undefined,
                  instructions: getParam(result, 'instructions') || (isRemote ? 'Payment request sent to the mobile wallet.' : 'Continue in the Paynow checkout.')
                }));
              } catch (error: any) {
                res.statusCode = 502;
                res.end(JSON.stringify({ success: false, error: error?.message || 'Unable to reach Paynow.' }));
              }
            });
          });

          server.middlewares.use('/api/paynow/poll', async (req: any, res: any) => {
            if (req.method !== 'GET') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Method not allowed.' }));
              return;
            }
            try {
              const key = String(env.PAYNOW_INTEGRATION_KEY || '').trim();
              const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
              const pollUrl = urlObj.searchParams.get('url');
              const parsed = pollUrl ? new URL(pollUrl) : null;
              if (!key || !parsed || parsed.protocol !== 'https:' || parsed.hostname !== PAYNOW_HOST) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Invalid Paynow poll request.' }));
                return;
              }
              const response = await fetch(parsed.toString(), { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: '', signal: AbortSignal.timeout(20000) });
              const params = new URLSearchParams(await response.text());
              if (!response.ok || !verifyHash(params, key)) {
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: getParam(params, 'error') || 'Unable to verify Paynow status.' }));
                return;
              }
              const status = getParam(params, 'status') || 'Created';
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, status, reference: getParam(params, 'reference'), amount: Number.parseFloat(getParam(params, 'amount') || '0') || 0, paynowReference: getParam(params, 'paynowreference') || undefined, isPaid: ['paid', 'awaiting delivery', 'delivered'].includes(status.toLowerCase()) }));
            } catch (error: any) {
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: error?.message || 'Unable to poll Paynow.' }));
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.')
      }
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {}
    }
  };
});
