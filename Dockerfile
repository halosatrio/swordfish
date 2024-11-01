FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Copy only the files needed for installation
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy the rest of the application
COPY . .

# Set the user to 'bun' for better security
USER bun

EXPOSE 8000
CMD [ "bun", "run", "index.ts" ]

# FROM oven/bun:1 AS base

# FROM base AS builder

# RUN apk add --no-cache gcompat
# WORKDIR /app

# COPY package.json tsconfig.json bun.lockb ./

# RUN bun install --frozen-lockfile

# FROM base AS runner
# WORKDIR /app

# RUN addgroup --system --gid 1001 bun
# RUN adduser --system --uid 1001 hono

# COPY --from=builder --chown=hono:bun /app/node_modules /app/node_modules
# COPY --from=builder --chown=hono:bun /app/dist /app/dist
# COPY --from=builder --chown=hono:bun /app/package.json /app/package.json

# USER hono
# EXPOSE 3000

# CMD ["bun", "rn", "/app/dist/index.ts"]