FROM oven/bun:1.0.11

WORKDIR /app

# Dependencies
COPY package.json package.json
COPY bun.lockb bun.lockb

# Backend
COPY server.js server.js

# Frontend (React)
COPY src src
COPY public public
COPY index.html index.html
COPY vite.config.js vite.config.js

# Install dependencies (for frontend, backend has none)
RUN bun install

# Build frontend
RUN bun run build

EXPOSE 3000

ENTRYPOINT ["bun", "run", "server.js"]