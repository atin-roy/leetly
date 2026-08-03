# Leetly

A LeetCode practice tracker built around spaced repetition. You log problems and
attempts; an FSRS scheduler decides what to review and when, so the queue is
driven by forgetting curves rather than by a list you maintain by hand.

Live at [leetly.atinroy.com](https://leetly.atinroy.com).

## Stack

| | |
|---|---|
| API | Spring Boot 4 / Java 25, Spring Security, Spring Data JPA, Flyway, PostgreSQL |
| Web | Next.js 16 (App Router) / React 19, TanStack Query, CSS Modules |
| Auth | Self-issued HS256 JWT, BCrypt, rotating refresh token with reuse detection |
| Tests | JUnit 5 + MockMvc (API), Vitest + Testing Library (web) |
| Deploy | GHCR images, GitHub Actions, Docker Compose behind Caddy on a VPS |

## Layout

```
apps/api     Spring Boot API
apps/web     Next.js web app
docs         design specs and engineering decisions
```

## Requirements

- Java 25
- pnpm 10+ and Node 24
- PostgreSQL 16+

## Local setup

Copy the env templates and fill them in:

```bash
cp .env.example .env                              # API + deployment values
cp apps/web/.env.local.example apps/web/.env.local # web values
```

Create the database:

```bash
createdb leetly && createuser leetly --pwprompt
```

Run the API. **The `dev` profile matters**: without it the app refuses to start
on the built-in placeholder signing key, which is deliberate — see
[engineering decisions](docs/engineering-decisions.md#the-jwt-secret-guard).

```bash
cd apps/api
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Run the web app:

```bash
pnpm install
pnpm --filter web dev
```

The web app serves on `http://localhost:3000`, the API on `http://localhost:8080`.

## Tests

```bash
cd apps/api && ./mvnw test     # 94 tests
pnpm --filter web test         # 45 tests
```

CI runs both before it will publish an image.

## Auth model

The API issues its own tokens; there is no external identity provider.

- **Access token** — HS256, 15 minutes, held **in memory only** by the browser.
  It is never written to `localStorage` or a readable cookie, so script injected
  into the page has nothing to steal that outlives the tab.
- **Refresh token** — 30 days, in an `HttpOnly` + `Secure` + `SameSite=Lax`
  cookie owned by the web app's origin. Rotated on every use, with reuse
  detection: replaying a spent token revokes the whole family.
- Because the access token lives only in memory, a page load has to redeem the
  cookie before it can fetch anything. That serial hop is the deliberate cost of
  the storage choice.

The API authenticates purely from the `Authorization` header — it issues no
session cookie and reads none — which is why CSRF protection is disabled on it.
The cookie surface is defended by `SameSite=Lax` instead. The reasoning is
written out in `SecurityConfig`.

## How the review scheduler works

`FsrsScheduler` implements FSRS: each card carries a *stability* (how long the
memory should last) and a *difficulty*, updated from your rating on each review.
Rate a card `Again` and stability collapses and the card comes back soon; rate it
`Easy` and the next interval stretches. The dashboard leads with what is due
because that queue is the product.

## Design system

Colour, type, spacing and density are tokens in `apps/web/styles/tokens.css`;
themes are complete palettes selected with `[data-theme]` in `app/globals.css`.

There is no `dark:` variant and no `.dark` class. Light and dark are whole
themes, not a modifier on one palette. Anything that needs a hue meaning the
same thing in every theme — difficulty, status, review ratings — fixes only the
hue and derives lightness by mixing against that theme's own `--card` and
`--foreground` (`components/ui/tone.module.css`).

Styling is mid-migration from Tailwind to CSS Modules. The dashboard, review,
problems and lists surfaces are done; account, problem detail, notes and the
attempt form are not.

## Deployment

Push to `main`. GitHub Actions path-filters the change, runs the relevant test
suite, publishes to GHCR, and a self-hosted runner pulls and restarts only the
service that changed, then verifies it is actually serving — `docker compose up`
succeeding says nothing about whether the app started.

Deployments must set `SPRING_PROFILES_ACTIVE=prod`.

## Further reading

- [Engineering decisions](docs/engineering-decisions.md) — the choices worth defending
- [Spaced repetition design](docs/superpowers/specs/2026-04-03-spaced-repetition-design.md)
- [Overhaul design](docs/superpowers/specs/2026-08-03-leetly-overhaul-design.md) — the Keycloak → self-issued JWT migration
