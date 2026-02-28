# Web App

Next.js frontend for Leetly.

## Run

```bash
pnpm --filter web dev
```

Open `http://localhost:3000`.

## Required Config

The web app expects:

- `NEXT_PUBLIC_API_URL`
- `AUTH_URL`
- `AUTH_SECRET`
- Keycloak client settings used by NextAuth

See [.env.example](/home/atin/projects/leetly/.env.example) for the shared environment shape.

## Dashboard

The dashboard reads stats from the API. `Total Solved` is expected to include:

- `SOLVED`
- `SOLVED_WITH_HELP`
- `MASTERED`
