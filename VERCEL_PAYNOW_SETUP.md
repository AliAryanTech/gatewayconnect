# Gateway Connect — Paynow setup

The Paynow Integration Key is server-only. Do **not** put it in `VITE_*` variables, source code, GitHub, or browser localStorage.

## Vercel Environment Variables

Set these for the Production environment (and Preview if you want to test previews):

```text
APP_URL=https://gatewayconnect.joedaniels.org
VITE_APP_URL=https://gatewayconnect.joedaniels.org
PAYNOW_INTEGRATION_ID=YOUR_PAYNOW_INTEGRATION_ID
PAYNOW_INTEGRATION_KEY=YOUR_PAYNOW_INTEGRATION_KEY
PAYNOW_MERCHANT_EMAIL=YOUR_PAYNOW_MERCHANT_EMAIL
PAYNOW_RETURN_URL=https://gatewayconnect.joedaniels.org/?payment=return
PAYNOW_RESULT_URL=https://gatewayconnect.joedaniels.org/api/paynow/webhook
```

After saving the variables, **redeploy the Vercel project**.

## Test mode

Paynow's current developer documentation provides mobile-money Express Checkout test numbers. For example, `0771111111` simulates a successful EcoCash/OneMoney result, while `0772222222` simulates a delayed success and `0773333333` simulates a cancellation. The `authemail` used in test mode must match the merchant account email for the integration.

## Production

Before accepting real payments, create/use the correct Paynow integration, enable the payment methods you need (EcoCash/OneMoney), and request the integration to be set live in Paynow.

## What this project does

- `POST /api/paynow/initiate` creates a Paynow transaction server-side.
- EcoCash/OneMoney use Paynow Express Checkout when a Zimbabwe mobile number is supplied.
- The Integration Key never comes from the browser request.
- `GET /api/paynow/poll` polls Paynow with the server-side key and verifies the response hash.
- `POST /api/paynow/webhook` accepts and verifies Paynow status callbacks.
- The browser does not call Paynow directly, so the Integration Key is not exposed through DevTools.
