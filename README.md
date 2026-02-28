# Leetly

Leetly is a LeetCode progress tracker with a Spring Boot API and a Next.js web app. It tracks problems, attempts, notes, lists, and a dashboard for streaks and solve activity.

## Apps

- `apps/api`: Spring Boot API
- `apps/web`: Next.js frontend

## Requirements

- `pnpm` 10+
- Java 25
- PostgreSQL

## Local Setup

Create environment variables as needed from [.env.example](/home/atin/projects/leetly/.env.example).

Backend defaults from [application.yaml](/home/atin/projects/leetly/apps/api/src/main/resources/application.yaml):

- database: `jdbc:postgresql://localhost:5432/leetly`
- username: `leetly`
- password: `leetly`
- API issuer: `KEYCLOAK_ISSUER_URI`

Frontend needs:

- `NEXT_PUBLIC_API_URL`
- NextAuth / Keycloak values for sign-in

## Run Locally

Start the API:

```bash
cd apps/api
./mvnw spring-boot:run
```

Start the web app:

```bash
cd /home/atin/projects/leetly
pnpm install
pnpm --filter web dev
```

Or run the monorepo dev command:

```bash
pnpm dev
```

The web app runs on `http://localhost:3000` by default.

## Dashboard Stats

Dashboard stats are calculated from current problem statuses and attempt history.

- `Total Solved` = `SOLVED + SOLVED_WITH_HELP + MASTERED`
- difficulty counts come from solved-status problems
- week and month totals are based on derived solve dates
- activity data is derived from attempts plus solved problems
- mistakes are aggregated from logged attempt mistakes

This avoids stale dashboard numbers when persisted counters drift from the actual problem state.

## Verification

Useful checks:

```bash
cd apps/api
./mvnw -DskipTests compile
```

```bash
cd /home/atin/projects/leetly
pnpm --filter web exec eslint components/stats/stats-cards.tsx components/stats/activity-calendar.tsx components/stats/difficulty-breakdown.tsx components/stats/mistakes-chart.tsx components/stats/pattern-breakdown.tsx
```

## Notes

- Full repo lint and test runs may still fail because of unrelated pre-existing issues outside the dashboard stats path.
