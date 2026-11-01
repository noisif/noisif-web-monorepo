FROM node:26-bookworm-slim AS pruner

RUN npm install -g pnpm turbo
WORKDIR /app
COPY . .
RUN turbo prune dashboard --docker

FROM node:26-bookworm-slim AS builder

RUN npm install -g pnpm turbo
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

RUN --mount=type=secret,id=app_env,target=/app/apps/dashboard/.env.production \
    turbo run build --filter=dashboard

FROM caddy:2.11.7

RUN addgroup -S nsgroup && \
    adduser -S nsuser -G nsgroup

RUN mkdir -p /config /data && \
    chown -R nsuser:nsgroup /config /data

ENV ENTRY_DIR=/app/nss-d

COPY --chown=nsuser:nsgroup --from=builder /app/apps/dashboard/build/ $ENTRY_DIR
COPY --chown=nsuser:nsgroup apps/dashboard/Caddyfile /etc/caddy/Caddyfile

LABEL maintainer="NOISIF"

EXPOSE 8080
USER nsuser
