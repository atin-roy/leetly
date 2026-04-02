# Repository Guidelines

## Project Structure & Module Organization
Leetly is a monorepo with two apps under `apps/`:

- `apps/web`: Next.js 16 frontend using the App Router. Pages live in `app/`, shared UI in `components/`, hooks in `hooks/`, browser/server utilities in `lib/`, and static assets in `public/`.
- `apps/api`: Spring Boot 4 API. Application code lives in `src/main/java/com/atinroy/leetly`, database migrations in `src/main/resources/db/migration`, and tests in `src/test/java`.

Root-level workspace files include `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.env.example`, and GitHub Actions in `.github/workflows/`.

## Build, Test, and Development Commands
- `pnpm install`: install workspace dependencies from the repo root.
- `pnpm dev`: run the Turborepo development pipeline.
- `pnpm build`: build all configured workspace targets.
- `pnpm lint`: run repo lint tasks.
- `pnpm --filter web dev`: start the frontend on `http://localhost:3000`.
- `pnpm --filter web build`: produce a production web build.
- `pnpm --filter web lint`: run frontend ESLint checks.
- `cd apps/api && ./mvnw spring-boot:run`: start the API locally.
- `cd apps/api && ./mvnw test`: run backend tests.
- `cd apps/api && ./mvnw -DskipTests compile`: quick backend compile verification.

## Coding Style & Naming Conventions
Follow the surrounding file style instead of reformatting unrelated code. The frontend uses TypeScript, React function components, and 2-space indentation. Use `kebab-case` for component filenames such as `problem-table.tsx`; keep exported React component names in `PascalCase`, hooks in `use-*.ts`, and utility modules concise.

The backend uses Java with Spring Boot, Lombok, and MapStruct. Keep packages grouped by feature (`problem`, `user`, `note`) and name classes by role: `*Controller`, `*Service`, `*Repository`, `*Dto`.

## Testing Guidelines
Backend tests use JUnit 5, Mockito, and AssertJ. Place tests under the matching package in `apps/api/src/test/java` and name them `*Test`. Prefer focused service and ownership/integrity tests similar to `ProblemServiceTest` and `ProblemOwnershipTest`.

There is no established frontend test suite yet; at minimum, run `pnpm --filter web lint` for web changes and `./mvnw test` for API changes before opening a PR.

## Commit & Pull Request Guidelines
Recent commits use short, imperative subjects such as `Fix attempt modal layout and timer` and `Harden web builds and redeploy problems sort`. Keep commits scoped and readable, ideally one logical change per commit.

PRs should include a brief summary, affected app(s), any config or migration impact, and linked issues when relevant. Add screenshots or recordings for UI changes, and call out new environment variables, Flyway migrations, or deployment considerations.
