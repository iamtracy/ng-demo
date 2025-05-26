FROM node:24-slim AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build -- --configuration=production

FROM node:24-slim AS server-builder
WORKDIR /app/server
# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl
COPY server/package*.json ./
RUN npm ci --legacy-peer-deps
COPY server/ .
RUN npx prisma generate && \
    npm run build

FROM node:24-slim AS production
WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

COPY server/package*.json ./
RUN npm ci --only=production --legacy-peer-deps

COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/prisma ./prisma
COPY --from=server-builder /app/server/node_modules/.prisma ./node_modules/.prisma
COPY --from=client-builder /app/client/dist/* ./public/

RUN addgroup --system appgroup && \
    adduser --system appuser --ingroup appgroup && \
    chown -R appuser:appgroup /app
USER appuser

ENV NODE_ENV=production \
    PORT=3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

EXPOSE 3000

CMD ["node", "dist/src/main"]
