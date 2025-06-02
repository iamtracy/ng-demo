FROM node:22-slim AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build -- --configuration=production

FROM node:22-slim AS server-builder
WORKDIR /app/server
RUN apt-get update -y && apt-get install -y openssl
COPY server/package*.json ./
RUN npm ci --legacy-peer-deps
COPY server/ .
RUN npx prisma generate && \
    npm run build

FROM node:22-slim AS production
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl curl

COPY server/package*.json ./
RUN npm ci --only=production --legacy-peer-deps

COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/prisma ./prisma
COPY --from=server-builder /app/server/node_modules/.prisma ./node_modules/.prisma
COPY --from=client-builder /app/client/dist/ng-demo/browser ./public/browser

RUN addgroup --system appgroup && \
    adduser --system appuser --ingroup appgroup --home /home/appuser && \
    mkdir -p /home/appuser/.npm && \
    chown -R appuser:appgroup /app /home/appuser

COPY start.application.sh /start.application.sh
RUN chmod +x /start.application.sh

USER appuser

ENV NODE_ENV=production \
    PORT=3000 \
    HOME=/home/appuser

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
    CMD curl --fail http://localhost:${PORT:-3000}/api/docs-json || exit 1

EXPOSE ${PORT:-3000}

CMD ["/start.application.sh"]
