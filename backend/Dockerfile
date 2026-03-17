FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache dumb-init

# Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# Final image
FROM base AS final
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p logs uploads

# Non-root user
RUN addgroup -S animacare && adduser -S animacare -G animacare
RUN chown -R animacare:animacare /app
USER animacare

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "src/server.js"]
