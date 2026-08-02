# Leetly resume-readiness overhaul — design

**Date:** 3 August 2026
**Context:** Placements start ~9 August 2026. Leetly is deployed at
`https://leetly.atinroy.com` and is one of three featured portfolio projects.

## Decisions taken

| Question | Decision |
|---|---|
| Tailwind → CSS Modules depth | Full rip-out, including the 28 `components/ui` primitives |
| Auth model | Spring-issued JWT, own user table, BCrypt, rotating refresh token in an httpOnly cookie. Keycloak and next-auth both removed |
| Order | Performance → Auth → Design → Functionality review |

Each phase is its own branch, spec section, and deploy.

---

## Phase 1 — Performance

### Root cause

Authenticated pages run a four-stage serialized waterfall:

1. Server renders the layout and calls `auth()` — `app/(app)/layout.tsx:9`
2. The browser hydrates. `SessionProvider` receives no initial session, so it
   fetches `/api/auth/session`, a full round-trip to the Node server
3. Every data hook is gated on `enabled: !!session?.accessToken`
   (`hooks/use-stats.ts:11` and the same pattern across all 11 hooks), so no
   query starts until stage 2 resolves
4. Each query then travels browser → Node → Spring, because `lib/api.ts:39`
   hardcodes `BASE = ""` in the browser

The dashboard runs four hooks, so roughly 150 ms elapses before the first byte
of data is requested, and every payload is then copied through a single Node
process.

The VPS is not the constraint: 12 GB RAM free, landing-page TTFB 187 ms.

### Changes

1. **Direct API base.** Use `NEXT_PUBLIC_API_URL` in the browser; drop the
   `/api/:path*` fallback rewrite. `lib/api.ts:37-40`, `next.config.ts:22-26`.
   No new infrastructure: `leetly-api.atinroy.com` is already routed in Caddy
   and its CORS preflight already allows `https://leetly.atinroy.com`.
2. **Seed the session.** Pass the server-resolved session into
   `SessionProvider session={...}`, removing the stage-2 round-trip.
   `app/layout.tsx`, `components/providers.tsx:33`.
3. **Remove the bulk lookups.** `problems/page.tsx:63` and
   `lists/[id]/page.tsx:70` each fetch 10,000 problems on mount to build a
   duplicate-detection `Map`. Replace with `GET /api/problems/leetcode-ids`
   returning a `long[]`.
4. **Turbopack build.** `next build` instead of `next build --webpack`.
   `apps/web/package.json:7`.
5. **Stale-time tuning.** Disable `refetchOnWindowFocus`; give the refs query a
   5 minute stale time. `components/providers.tsx`.
6. **Token out of the query keys.** `use-problems.ts:84` and
   `use-settings.ts:18` included `session.accessToken` in their React Query
   keys. The token rotates, so every refresh produced new keys and discarded
   the entire problems cache — a full refetch on a timer.

### Also fixed: a date-dependent test

`StatsServiceTest` had two failing assertions, both `getSolvedThisWeek()`.
The production calculation was correct; the test was not deterministic.
`StatsService` derived "this week" from
`LocalDate.now().with(DayOfWeek.MONDAY)` while the fixtures placed solves at
`LocalDate.now()` minus one to five days. Run on a Monday, `startOfWeek` equals
today and those solves fall into the previous calendar week. The suite passed
mid-week and failed on Mondays, which is why the audit recorded a different
value ("expected 3 but was 2") than the one observed here ("expected 3 but was
1").

The fix injects `java.time.Clock` (new `config/ClockConfig`), replaces all seven
`LocalDate.now()` calls in `StatsService`, and pins the test to a fixed Thursday
instant. The suite no longer reads the system clock and is green at 44/44.

### Notes

- Change 3 is also a correctness fix. The uncommitted working-tree diff gives
  `AddProblemDialog` a real duplicate map (it previously received `new Map()`,
  so duplicate detection was dead code) but pays for it with a full-table
  fetch. The new endpoint preserves the behaviour at a fraction of the cost.
- The `ProblemService.create` idempotency change and its test in the working
  tree are sound and are kept.
- Change 2 overlaps Phase 2. The server→client token handoff is shaped so it
  survives the auth migration rather than being discarded.

### Verification

Before/after measurements on the deployed dashboard, collected identically:
TTFB, time to first data request, time to all queries settled. Plus
`pnpm --filter web build`, `pnpm --filter web lint`, and `./mvnw test` green.

---

## Phase 2 — Keycloak → Spring-issued JWT

### Approach

The OAuth2 resource-server model is kept and only the *issuer* changes: Spring
signs access tokens with a symmetric key (`JwtConfig`) and verifies them with
its own `JwtDecoder`. Controllers keep receiving a `Jwt` principal, so all 20+
of them and every `jwt.getSubject()` call are untouched. No new dependencies —
the resource-server starter already ships Nimbus.

### Data migration

Production has six users; only one has real data (127 problems, 38 attempts).
`V16__local_jwt_auth.sql` renames `keycloak_id` to `subject_id` rather than
dropping it, so existing rows keep their identity and no data is re-linked. It
adds `password_hash`, a unique index on `LOWER(email)`, and a `refresh_tokens`
table.

**Cutover requirement:** the existing account has no `password_hash` and cannot
log in until one is set. `AuthService.login` treats a null hash as a failed
login rather than as a passwordless account.

### Token design

- Access token: JWT, 15 minutes, held **in memory only** by the client. Never
  in `localStorage` or a readable cookie, so an injected script has nothing that
  outlives the tab.
- Refresh token: opaque random material, not a JWT, because a self-contained
  token cannot be revoked. Stored only as a SHA-256 digest, so read access to
  the table does not yield a usable token.
- Rotation with reuse detection: presenting an already-rotated token revokes
  every token for that user, on the assumption the token leaked.

### Cookie ownership

The API returns both tokens in the response body and sets no cookies. The web
app's own server puts the refresh token in a **first-party** httpOnly cookie on
`leetly.atinroy.com`. Had the API set it, the cookie would be third-party to the
web app and browsers that block third-party cookies would silently break session
renewal. The refresh token never reaches the browser.

Data requests still go browser → API directly; only the three auth calls pass
through the Next.js server.

### Removed

`next-auth`, `lib/auth.ts`, `lib/sign-in-action.ts`, `app/auth/start`,
`app/api/auth/[...nextauth]`, and `KeycloakJwtAuthenticationConverter`. The
`keycloak` container and the `auth.atinroy.com` Caddy block can be retired.

### Verification

61 backend tests green, up from 44. New: `AuthServiceTest` (9 unit tests) and
`AuthFlowIntegrationTest` (8 tests through the real filter chain — registration,
login, token verification, rotation, replay rejection, and cross-user
isolation). CI now has `verify-api` and `verify-web` jobs that image publication
and deployment depend on.

## Phase 3 — Tailwind → CSS Modules and redesign

Full removal of Tailwind and `tailwind-merge`. The 28 Radix-based primitives in
`components/ui` are restyled through CSS Modules against Radix directly. A new
study-centric visual identity is applied across the app shell, the marketing
pages (`app/page.tsx`, `about`, `privacy`, `terms`), and all feature pages, with
phone and tablet breakpoints treated as first-class.

## Flyway was not running in production

Found during the Phase 2 deploy, when the API crash-looped on
`Schema validation: missing table [refresh_tokens]`.

**Root cause.** Spring Boot 4 split auto-configuration into per-technology
modules. `flyway-core` provides the library but not the Spring integration,
which now lives in `org.springframework.boot:spring-boot-flyway`. That module
was absent, so Flyway was never wired up. Because the library was still on the
classpath nothing failed at startup, and migrations simply stopped being
applied at some point during the Boot 4 upgrade.

Evidence: `flyway_schema_history` held three rows (baseline V6, then V7 and
V12) while the objects created by V8–V11 and V13–V15 all existed, and no Flyway
log line appeared at startup. V16 was the first migration whose absence broke
schema validation, which is the only reason it surfaced.

**Fix.** Added the `spring-boot-flyway` dependency, plus `FlywayWiringTest`,
which asserts a `Flyway` bean is auto-configured. The test was verified to fail
with the dependency removed and pass with it restored.

**History reconciliation.** The deployed schema is at V16 — confirmed by
Hibernate `ddl-auto: validate` passing, which checks every entity against every
table. The incomplete history table was renamed to
`flyway_schema_history_pre_v16_backup` rather than dropped, and
`SPRING_FLYWAY_BASELINE_VERSION` moved from 4 to 16 so Flyway adopts the
existing schema at that point. V17 onward apply normally.

## The deploy reported success on a crash-looping API

`docker compose up -d` returns as soon as the container is created, so the CI
deploy job was green while the API failed to start. Three checks now close
that gap:

1. `/actuator/health` is permitted in `SecurityConfig` (UP/DOWN only, details
   remain disabled) so it can be probed at all.
2. The deploy job polls health for up to 150 s, and on failure prints the last
   60 container log lines and fails.
3. A container-level `healthcheck` in the compose file so `docker ps` reports
   real state.

## Phase 4 — Functionality and resume readiness

The failing `StatsServiceTest.getByUser_recalculatesStatsFromProblemsAndAttempts`,
explicit CI test and lint gates that image publication depends on, a README with
screenshots and a live URL, and recruiter demo access. Feature-gap proposals are
raised with the user rather than built unilaterally.
