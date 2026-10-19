# syntax=docker/dockerfile:1
# Image produksi: server Next.js mandiri. Semua data (database SQLite, termasuk foto
# yang diunggah dari admin) ada di volume /data.

FROM node:22-bookworm-slim AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Domain final untuk canonical, og:image, sitemap; ditanam saat build
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
# Database sementara khusus build (prerender); database sebenarnya di /data saat jalan
RUN pnpm build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL=file:/data/iwan-sukses.db
RUN mkdir -p /data && chown node:node /data
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
# Migrasi dijalankan saat start (src/instrumentation.ts); font untuk og:image
COPY --from=builder --chown=node:node /app/drizzle ./drizzle
COPY --from=builder --chown=node:node /app/assets/fonts ./assets/fonts
USER node
VOLUME /data
EXPOSE 3000
CMD ["node", "server.js"]
