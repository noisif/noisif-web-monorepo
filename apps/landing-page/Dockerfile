FROM node:26-bookworm-slim AS pruner

RUN npm install -g pnpm turbo
WORKDIR /app
COPY . .
RUN turbo prune landing-page --docker

FROM node:26-bookworm-slim AS builder

RUN npm install -g pnpm turbo
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

RUN --mount=type=secret,id=app_env,target=/app/apps/landing-page/.env.production \
    turbo run build --filter=landing-page

FROM node:26-bookworm-slim AS runner

WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=8080

RUN groupadd --system nsgroup && \
    useradd --system --gid nsgroup nsuser && \
    chown nsuser:nsgroup /app

COPY --chown=nsuser:nsgroup --from=builder /app/ .

LABEL maintainer="NOISIF"

EXPOSE $PORT
USER nsuser

ENTRYPOINT [ "node", "apps/landing-page/build/index.js" ]
