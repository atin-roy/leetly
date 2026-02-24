# Leetly Web App

This is the Next.js frontend for Leetly.

## Authentication setup

This app uses **NextAuth.js** with the **Keycloak provider** in `app/api/auth/[...nextauth]/route.ts` and `lib/auth.ts`.

Because of that, NextAuth automatically exposes callback routes under `/api/auth/*`, including:

- `/api/auth/signin`
- `/api/auth/callback/keycloak`

If `/api/auth/callback/keycloak` is returning 404, verify that:

1. The Next.js app is running (not only the API service).
2. The auth route exists at `app/api/auth/[...nextauth]/route.ts`.
3. Keycloak provider env vars are set:
   - `KEYCLOAK_ISSUER`
   - `KEYCLOAK_CLIENT_ID`
   - `KEYCLOAK_CLIENT_SECRET`
4. Your Keycloak client redirect URI includes:
   - `http://localhost:3000/api/auth/callback/keycloak` (or your deployed domain equivalent)

> Note: If you replace NextAuth with a custom auth flow, `/api/auth/callback/keycloak` will not exist unless you create that route yourself.

## Getting started

Run the development server:

```bash
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).
