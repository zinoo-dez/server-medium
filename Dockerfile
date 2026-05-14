# Use Node.js 20 slim (Debian) for better compatibility with Prisma
FROM node:20-slim AS base

# Install dependencies
FROM base AS deps
RUN apt-get update && apt-get install -y openssl libssl-dev
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the TypeScript project
RUN npm run build

# Runner stage
FROM base AS runner
WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Create a non-root user
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 expressjs

# Create uploads directory and set ownership
RUN mkdir -p uploads && chown expressjs:nodejs uploads

# Copy built assets and necessary files with correct ownership
COPY --from=builder --chown=expressjs:nodejs /app/dist ./dist
COPY --from=builder --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=expressjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=expressjs:nodejs /app/tsconfig.json ./tsconfig.json

USER expressjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "dist/src/server.js"]
