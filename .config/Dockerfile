FROM oven/bun:1-alpine AS builder

WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache nodejs

COPY package.json bun.lock tsconfig.json ./

RUN bun install

COPY . .
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" bun run prisma generate && bun run prepare && node node_modules/nuxt/bin/nuxt.mjs build


FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Keep the version in sync with "prisma" in package.json.
# The CLI is only used for `migrate deploy`, so the Studio UI, dev-server and
# MySQL parts are pruned (~80MB) and the npm cache (~290MB) is dropped from
# the layer.
RUN npm install -g prisma@7.8.0 --no-fund --no-audit \
    && cd /usr/local/lib/node_modules/prisma/node_modules \
    && rm -rf @electric-sql react-dom chart.js mysql2 hono \
        @prisma/studio-core/dist/ui \
        @prisma/studio-core/dist/metafile-esm.json \
        @prisma/studio-core/dist/metafile-cjs.json \
    && rm -rf /root/.npm /tmp/*
ENV NODE_PATH=/usr/local/lib/node_modules

RUN addgroup -S app && adduser -S app -G app \
    && mkdir -p /app/uploads && chown -R app:app /app

COPY --chown=app:app --from=builder /app/.output ./.output
COPY --chown=app:app prisma ./prisma
COPY --chown=app:app prisma.config.js ./prisma.config.js

COPY --chown=app:app --chmod=755 .config/entrypoint.sh ./entrypoint.sh

USER app

EXPOSE 3000

CMD ["./entrypoint.sh"]
