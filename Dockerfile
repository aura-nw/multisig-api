FROM node:16.17-alpine as build-stage

COPY --chown=node:node package*.json ./

# ✅ Safe install
RUN npm ci
COPY --chown=node:node . .
RUN npm run build

# Run-time stage
FROM node:16.17-alpine as run-stage
USER node

ARG PORT=3000
EXPOSE $PORT
WORKDIR /app

COPY --chown=node:node --from=build-stage node_modules ./node_modules
COPY --chown=node:node --from=build-stage dist package*.json ./

# ✅ Clean dev packages
RUN npm prune --production

CMD [ "node", "src/main.js" ]
