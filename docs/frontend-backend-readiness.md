# Frontend ↔ Backend Readiness (Keycloak + Docker on VPS)

This repo is mostly ready for replacing dummy data with real API calls:

- Frontend API client already uses a configurable base URL via `NEXT_PUBLIC_API_URL`.
- Frontend auth is wired to Keycloak through NextAuth with token refresh.
- Backend is configured as an OAuth2 resource server and validates JWTs from Keycloak.

## What was missing and is now added

1. **Backend CORS policy**
   - Added configurable CORS support in API security config.
   - New env var: `APP_CORS_ALLOWED_ORIGINS` (comma-separated).

2. **Env consistency for Keycloak and API URLs**
   - Added `KEYCLOAK_ISSUER` for web (NextAuth).
   - Added `NEXT_PUBLIC_API_URL` for frontend runtime target.
   - Kept `KEYCLOAK_ISSUER_URI` for backend JWT validation.

## Deployment notes (VPS)

- Use the same public issuer URL in both frontend and backend:
  - `KEYCLOAK_ISSUER` (web)
  - `KEYCLOAK_ISSUER_URI` (api)
- Build frontend image with production API URL:
  - `--build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
- Set backend CORS origins to your frontend URL(s):
  - `APP_CORS_ALLOWED_ORIGINS=https://yourdomain.com`
- In Keycloak client settings for web app, configure:
  - Valid Redirect URIs: `https://yourdomain.com/*`
  - Web Origins: `https://yourdomain.com`

## CI/CD checklist

- Build and push both images in pipeline.
- Inject all env vars at deploy time (secrets manager or VPS env file).
- Ensure reverse proxy routes:
  - `https://yourdomain.com` → frontend container
  - `https://api.yourdomain.com` → backend container
  - `https://auth.yourdomain.com` → keycloak container

