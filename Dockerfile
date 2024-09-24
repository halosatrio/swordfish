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