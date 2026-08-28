# syntax=docker/dockerfile:1.7
# Frankencoin dapp — multi-stage production build.
# Build: docker build -t fc-dapp .
# Run:   docker run --rm -p 3000:3000 fc-dapp

# ---- deps ----
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# ---- builder ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* are baked into the JS bundle at build time.
# Hosted-backend defaults match the canonical Frankencoin stack.
ARG NEXT_PUBLIC_LANDINGPAGE_URL=https://frankencoin.com
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_URL=https://api.frankencoin.com
ARG NEXT_PUBLIC_PONDER_URL=https://ponder.frankencoin.com
ARG NEXT_PUBLIC_MORPHOGRAPH_URL=https://blue-api.morpho.org/graphql
ARG NEXT_PUBLIC_PROFILE=mainnet
ARG NEXT_PUBLIC_WAGMI_ID
ARG NEXT_PUBLIC_RPC_KEY
ARG NEXT_PUBLIC_UMAMI_URL
ARG NEXT_PUBLIC_UMAMI_WEBSITE_ID

ENV NEXT_PUBLIC_LANDINGPAGE_URL=$NEXT_PUBLIC_LANDINGPAGE_URL \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_PONDER_URL=$NEXT_PUBLIC_PONDER_URL \
    NEXT_PUBLIC_MORPHOGRAPH_URL=$NEXT_PUBLIC_MORPHOGRAPH_URL \
    NEXT_PUBLIC_PROFILE=$NEXT_PUBLIC_PROFILE \
    NEXT_PUBLIC_WAGMI_ID=$NEXT_PUBLIC_WAGMI_ID \
    NEXT_PUBLIC_RPC_KEY=$NEXT_PUBLIC_RPC_KEY \
    NEXT_PUBLIC_UMAMI_URL=$NEXT_PUBLIC_UMAMI_URL \
    NEXT_PUBLIC_UMAMI_WEBSITE_ID=$NEXT_PUBLIC_UMAMI_WEBSITE_ID \
    NEXT_TELEMETRY_DISABLED=1

RUN yarn build

# ---- runner ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
