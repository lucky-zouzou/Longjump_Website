FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN npm install -g pnpm@10.33.2
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --fetch-timeout=600000 --fetch-retries=5
COPY . .
RUN pnpm build:server

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000 LOONGJUMP_DATA_DIR=/data LOONGJUMP_BACKUP_DIR=/backups
COPY --from=build --chown=node:node /app /app
RUN mkdir /data /backups && chown node:node /data /backups
USER node
EXPOSE 3000
VOLUME ["/data", "/backups"]
CMD ["node", "server/index.mjs"]
