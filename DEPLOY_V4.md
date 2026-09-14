# Gateway Connect V4 deployment

## GitHub
Upload the CONTENTS of this folder to the repository root. `package.json`, `index.html`, `src/`, `public/`, `api/` (if present) must be at the repository root.

Do not upload `.env.local` or real payment credentials.

## Vercel
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

If the project uses Supabase/Paynow secrets, add them in Vercel Project Settings -> Environment Variables.

## Local verification
Run:

    npm install
    npm run build

Then:

    npm run preview
