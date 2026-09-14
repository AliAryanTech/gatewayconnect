# Payment setup

Paynow now uses the server-side `/api/paynow/initiate` and `/api/paynow/poll` routes.

Set these environment variables on the deployment/server (do not put the Integration Key in frontend code):

- `PAYNOW_INTEGRATION_ID`
- `PAYNOW_INTEGRATION_KEY`
- `PAYNOW_MERCHANT_EMAIL`
- `PAYNOW_RETURN_URL`
- `PAYNOW_RESULT_URL`

The old local `.env.local` file was removed from the source package because it contained placeholder/credential material.

For a Node deployment, make sure the app is reachable at the configured `PAYNOW_RESULT_URL`.
