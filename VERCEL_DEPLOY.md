# Vercel deployment

## GitHub repository structure
The contents of this folder must be the repository root. `package.json`, `index.html`, `src/`, `api/`, and `vite.config.ts` must be directly visible at the top level of the GitHub repository.

Do not upload the `gatewayconnect-main` folder as a nested project folder unless Vercel Project Settings > Root Directory is set to that folder.

## Vercel settings
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Node.js: 20.x or newer

## Environment variables
For Supabase, configure the variables used by the app, such as:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

For Paynow serverless API:
- `PAYNOW_INTEGRATION_ID`
- `PAYNOW_INTEGRATION_KEY`
- `PAYNOW_MERCHANT_EMAIL`
- `PAYNOW_RETURN_URL`
- `PAYNOW_RESULT_URL`

Never put the Paynow integration key in a `VITE_` variable.
