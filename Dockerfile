# ──────────────────────────────────────────────────────────────
# Medius AP Automation Platform - Production Dockerfile
# Multi-stage build for minimal image size and security
# ──────────────────────────────────────────────────────────────

# ─── Stage 1: Dependencies ────────────────────────────────────
FROM node:20-alpine AS deps

# Install libc6-compat for Alpine compatibility with some npm packages
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files first for optimal Docker layer caching.
# Changes to source code won't invalidate the dependency cache layer.
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies needed for prisma generate and build)
RUN npm ci

# ─── Stage 2: Build ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Generate Prisma client for PostgreSQL
RUN npx prisma generate

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the Next.js application (standalone output mode)
RUN npm run build

# ─── Stage 3: Production ─────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install curl for health checks and openssl for Prisma
RUN apk add --no-cache curl openssl

# Set production environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security (principle of least privilege)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets (static files served by Next.js)
COPY --from=builder /app/public ./public

# Copy the Next.js standalone output (includes server.js and minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and generated client (needed at runtime for database operations)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy ioredis and its dependencies for Redis cache support at runtime
COPY --from=builder /app/node_modules/ioredis ./node_modules/ioredis
COPY --from=builder /app/node_modules/iconv-lite ./node_modules/iconv-lite
COPY --from=builder /app/node_modules/safer-buffer ./node_modules/safer-buffer
COPY --from=builder /app/node_modules/denque ./node_modules/denque
COPY --from=builder /app/node_modules/redis-errors ./node_modules/redis-errors
COPY --from=builder /app/node_modules/redis-parser ./node_modules/redis-parser
COPY --from=builder /app/node_modules/cluster-key-slot ./node_modules/cluster-key-slot
COPY --from=builder /app/node_modules/standard-as-callback ./node_modules/standard-as-callback
COPY --from=builder /app/node_modules/lodash.defaults ./node_modules/lodash.defaults
COPY --from=builder /app/node_modules/lodash.isarguments ./node_modules/lodash.isarguments
COPY --from=builder /app/node_modules/debug ./node_modules/debug
COPY --from=builder /app/node_modules/ms ./node_modules/ms

# Ensure the nextjs user owns the working directory
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3000

# Health check: verify the application is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the Next.js standalone server
CMD ["node", "server.js"]
