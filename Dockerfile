FROM oven/bun:1.0.11

WORKDIR /app

COPY index.js index.js

EXPOSE 3000

ENTRYPOINT ["bun", "run", "index.js"]