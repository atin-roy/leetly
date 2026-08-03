# Engineering decisions

The choices in Leetly worth being able to defend, and the reasoning behind them.
Each entry states the decision, why the obvious alternative was rejected, and
what it costs — the tradeoff is the interesting part, not the choice.

---

## Auth

### Why self-issued JWTs instead of Keycloak

Leetly originally used Keycloak with NextAuth in front of it. That is three
moving parts (identity server, its database, an adapter library) to authenticate
users against a single application that owns its own user table anyway. The
whole thing was replaced with a `JwtEncoder`/`JwtDecoder` pair and a BCrypt
password column.

The app stayed an OAuth2 resource server — only the issuer changed — so
controllers still receive a `Jwt` principal and none of the authorization code
moved.

**Cost:** no SSO, no social login, no admin console, and password reset is now
mine to build. All acceptable for a single-application product; all reasons to
go back to an identity provider if that stops being true.

### Where the tokens live, and why

- **Access token — in memory only.** Not `localStorage`, not a readable cookie.
  Anything an injected script can read, it can exfiltrate, and `localStorage`
  survives the tab. Holding it in a React ref means an XSS gets at most the
  current page's token, not a durable credential.
- **Refresh token — `HttpOnly` + `Secure` + `SameSite=Lax` cookie.** Script
  cannot read it at all. It rotates on every use, and replaying a spent token
  revokes the entire family — the standard reuse-detection response, on the
  assumption that a replayed token means it was stolen.

**Cost, and it is real:** because nothing durable is readable from JS, a page
load must redeem the cookie over the network *before* it can issue any data
request. That is a guaranteed serial hop on every cold load. The alternative —
seeding the token into the server-rendered HTML — leaks it into the document and
into any cache that holds the response. The latency was the deliberate trade.

### One timer, never two

`AuthProvider` runs a single `setTimeout` that serves both jobs: with no session
it fires immediately to redeem the cookie, and afterwards it fires 60s before
expiry to renew. It is one timer specifically so renewals can never overlap —
each renewal *rotates* the refresh token, so two in flight means the second
presents a token the first already spent, which trips reuse detection and signs
the user out. The delay is floored at 30s so a short-lived token cannot spin the
loop.

This invariant is the thing most worth a test, and it has one.

### Why CSRF protection is disabled on the API

Not an oversight. CSRF attacks work by riding an *ambient* credential the browser
attaches automatically. This API authenticates purely from the `Authorization`
header, which a cross-site form post cannot set; it issues no session cookie and
reads none. A CSRF token would be guarding a mechanism that does not exist here.

The cookie in this system belongs to the *web app's* origin, not the API's, and
that surface is defended with `SameSite=Lax` — which is what actually prevents a
cross-site POST from carrying the refresh cookie. `allowCredentials(true)` on
CORS is only safe because the allowed-origin list is explicit and never a
wildcard.

### The JWT secret guard

The API refuses to start on the known placeholder signing key unless `dev` or
`test` is explicitly among the active profiles.

The first version of this checked for the `prod` profile instead. It was
worthless, and finding out why is the useful part: **the deployment did not set
`SPRING_PROFILES_ACTIVE` at all**, so it ran under the default profile and the
guard could never fire — precisely in the environment it existed to protect. A
guard that requires the configuration to already be correct in order to detect
the configuration being incorrect protects nothing.

Inverting it to key on the *secret* rather than the *profile* makes it fail
closed. The lesson generalises: a safety check should assume the surrounding
config is wrong, because that is the case it exists for.

### Rate limiting, and the header you cannot trust

Login and register are limited to 10 requests/minute per client, fixed-window
and in memory. Bucket4j and Redis were rejected: the app is a single instance, so
there is no distributed-counter problem to solve, and a dependency that solves a
problem you do not have is a liability.

The subtle part is identifying the client. Behind a reverse proxy,
`getRemoteAddr()` is the proxy for every request, so everyone shares one bucket.
The fix is `X-Forwarded-For` — but naively:

```java
forwarded.split(",")[0]   // WRONG
```

Caddy *appends* the peer it observed, so a client that sends
`X-Forwarded-For: 1.2.3.4` produces `"1.2.3.4, <real client>"`. Reading the first
entry reads the attacker's value: a fresh bucket per request from one header,
which defeats the limiter entirely and grows the bucket map without bound as a
bonus denial-of-service.

Correct: read the **last** entry — the one our own proxy appended — and only when
the immediate peer is actually the proxy. Anything arriving from outside the
container network has headers that mean nothing.

---

## API design

### Aggregate in the database, not in the browser

The dashboard's problem counts once shipped up to 1000 rows to the client so it
could `filter().length` them. Now `countByDifficultyAndStatus` returns a
`GROUP BY` result and the API returns a small counts DTO.

The general rule: if the client is downloading rows only to reduce them, the
reduction belongs in the query.

### …but not always

The command palette searches the user's **entire** problem set client-side, from
one unpaginated endpoint. That looks like the opposite decision, and the
reasoning is what makes it consistent: a personal library is hundreds of rows of
`(id, title)` — a few KB, already fetched for the add-problem duplicate check,
and cached. Adding a search endpoint would mean a network round-trip per
keystroke to filter data the client already holds.

The rule is not "aggregate on the server." It is "move the work to whichever side
avoids shipping data that gets thrown away." At a few thousand problems this
flips, and the endpoint gets built then.

### Ownership is enforced in the query

Every user-scoped lookup takes the user as a parameter — `findByIdAndUser`, not
`findById` followed by a check. A missing ownership check on a fetch-then-compare
is invisible in review; a missing parameter fails to compile or returns nothing.
Wrong-owner requests return **404, not 403**, so the API does not confirm that an
id exists.

### Attempt numbering takes a pessimistic lock

`logAttempt` acquires `PESSIMISTIC_WRITE` on the problem row before counting
existing attempts and inserting. Two concurrent attempts on the same problem
would otherwise both read count `n` and both insert `n+1`. There is a unique
constraint on `(problem_id, user_id, attempt_number)` as the backstop, but the
lock means the second request waits rather than failing.

---

## Frontend

### There is no dark mode

There are eighteen themes, each a complete palette selected by `[data-theme]`.
There is no `.dark` class and no `dark:` variant.

This started as a bug worth remembering. The codebase *had* ~20 `dark:` variants,
and none of them had ever applied, because nothing ever set a `.dark` class —
theme switching wrote `data-theme`. So on all eleven dark themes, a "Solved" chip
rendered `bg-green-100 text-green-800`: a pale mint pill on a near-black card.
It compiled, it linted, and it was wrong on every dark theme for as long as they
had existed.

The fix generalises the problem. Chips that must mean the same thing in every
theme fix only the **hue**, and derive lightness by mixing against that theme's
own tokens:

```css
.tone {
  background: color-mix(in oklch, var(--tone) 15%, var(--card));
  color:      color-mix(in oklch, var(--tone) 68%, var(--foreground));
}
```

On a light theme `--foreground` is near-black and the text resolves dark; on a
dark theme it is near-white and the same declaration resolves light. One rule, no
variants, correct in all eighteen themes — and impossible to have the class of
bug that variants invite, where one branch is never exercised.

### CSS Modules over Tailwind

Migration, not religion. The reason is that this UI is dense and token-driven,
and long utility strings were hiding the design system: `rgba(15,23,42,0.35)`
appeared in ten files as a "shadow", which on the dark themes was a visibly blue
shadow nobody had looked at. Named tokens in a stylesheet make that reviewable.

**Honest state:** four surfaces are migrated, four are not. Mixed-mode styling is
a real cost, and the two systems are pinned to the same tokens so they cannot
drift while it lasts.

### The command palette is hand-written

`cmdk` was in `node_modules` and unused. It stayed unused: the palette's actual
content is a ranking function and a keyboard model, both small, and the part a
library really earns — combobox/listbox roles with `aria-activedescendant` — is
about fifteen lines written explicitly.

It is lazy-loaded behind `next/dynamic`: only the hotkey listener is in the
initial bundle, and the dialog plus its data (7 KB gzipped) load on first open,
which for most sessions never happens.

### Render progressively, not all-or-nothing

The dashboard runs four queries. It used to gate the whole page on all four,
which meant the due queue — the largest paint, and the reason the page exists —
waited on stats and counts it never reads. Each block now waits only on its own
request.

The general failure: `if (aLoading || bLoading || cLoading) return <Skeleton/>`
is the easy shape, and it makes the slowest request the speed of the page.

---

## Testing

Tests were written where being wrong is expensive, not where assertions are easy.

- The **token renewal timer**, including the never-overlapping invariant.
- **Markdown rendering** cannot inject `<script>`, event handlers, or
  `javascript:` URLs. These are react-markdown *defaults* — a future "let me just
  enable raw HTML" would remove them silently, and notes are user-authored text
  rendered back into the page.
- The **semantic chips** carry no fixed palette class and no `dark:` variant —
  pinning the exact bug that shipped.
- **IDOR**: wrong-owner access returns 404 across problems, lists and attempts.

Two Vitest configuration details worth knowing, because both fail silently in the
dangerous direction:

- **CSS Modules are processed, not stubbed.** Stubbed, `styles.foo` is
  `undefined`, and every assertion about a state-carrying class passes against
  nothing.
- **Radix is inlined.** pnpm leaves it external, where its CJS `require("react")`
  resolves a *second* React instance and every hook inside a primitive throws
  "Invalid hook call". Next's bundler dedupes already, which is why this only
  appears under test.

---

## Deployment

### Verify the app is serving, not that the container was created

`docker compose up -d` succeeds as soon as the container exists, which says
nothing about whether the process started. The deploy job polls
`/actuator/health` for `"status":"UP"` and dumps container logs on timeout.
Without it, a crash-looping API reports a green deploy.

Only `/actuator/health` is public; every other actuator endpoint returns 401.

### The image that only worked by accident

The published web image had `WORKDIR /app`, but a pnpm workspace's standalone
build puts the entrypoint at `/app/apps/web/server.js`. It never surfaced because
the deployed compose file supplied `working_dir: /app/apps/web` — so production
was fine and the *image* was broken. Pull it and `docker run` it and it exits
immediately with `MODULE_NOT_FOUND`.

Found by building and running the image rather than reading the Dockerfile. An
artifact that only works inside one caller's configuration is not portable, and
the configuration that rescues it is easy to lose.

### Path-filtered CI

`dorny/paths-filter` gates the API and web jobs independently, so a CSS change
does not rebuild and redeploy the Spring Boot service. Test suites run before any
image is published.

---

## Things I would change next

Stated plainly, because "what would you do differently" is always asked.

1. **Finish the CSS Modules migration.** Four surfaces still carry ~940 utility
   classes. Mixed-mode styling is a cost being paid every day it lasts.
2. **Secrets have hardcoded fallbacks in the compose file.** `${VAR:-<literal>}`
   for both the JWT signing key and the database password means the real values
   sit in plaintext there, and in every `.bak` copy beside it. They belong in an
   env file, and they should be rotated.
3. **The rate limiter is per-instance.** Correct today because there is one
   instance. A second one halves its effectiveness silently — that is when the
   shared store stops being over-engineering.
4. **No structured logging or error tracking.** A production exception is found
   by reading `docker logs`, and it is gone when the container is recreated. I
   lost one that way during this work.
5. **Refresh-token revocations are never pruned.** The table grows forever.
