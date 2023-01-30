# Install dependencies and rebuild the source code only when neededonly
FROM node:18-alpine AS builder
ENV NODE_ENV production

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

# Note yarn rebuild - this is to let yarn rebuild binaries
RUN yarn rebuild && yarn build

# Production image, copy all the files and run next
FROM node:18-alpine AS runner

RUN apk add --no-cache ffmpeg yt-dlp

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

ENV NODE_ENV production
ENV NEXT_MANUAL_SIG_HANDLE true
WORKDIR /app

# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/.yarnrc.yml ./.yarnrc.yml
COPY --from=builder /app/.pnp.cjs ./.pnp.cjs
COPY --from=builder /app/package.json ./package.json

# The step below is from the Next.js Dockerfile example, but we don't need it because we use Yarn's Zero-installs.
# COPY --from=builder /app/node_modules ./node_modules

# Note yarn rebuild again - this is to let yarn rebuild binaries in the "runner" stage of the Dockerfile
# We also have to remove unplugged, so that rebuilding happens and replaces the old binaries
RUN rm -rf /app/.yarn/unplugged && yarn rebuild
RUN chown -R nextjs:nodejs /app/.next

USER nextjs

EXPOSE 3000

ENV NEXT_TELEMETRY_DISABLED 1

CMD ["yarn", "start"]