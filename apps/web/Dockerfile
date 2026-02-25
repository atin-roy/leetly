# Build context must be the monorepo root:
#   docker build --file apps/web/Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.example.com .

# ── Stage 1: install dependencies ────────────────────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable

# Copy workspace manifests so pnpm can resolve the monorepo correctly
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json

# Install only the web workspace's dependencies (production + dev for build)
RUN pnpm install --frozen-lockfile --filter web

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app
RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY apps/web ./apps/web
COPY package.json pnpm-workspace.yaml ./

# NEXT_PUBLIC_API_URL is inlined into the JS bundle at build time.
# Pass the production API URL when building the image:
#   docker build --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app/apps/web
RUN pnpm build

# ── Stage 3: minimal runtime ──────────────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system nodejs && adduser --system --ingroup nodejs nextjs

# Standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Runtime env vars (NOT baked in — pass at docker run / compose):
#   AUTH_SECRET, AUTH_URL,
#   KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET, KEYCLOAK_ISSUER

ENTRYPOINT ["node", "server.js"]
