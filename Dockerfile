FROM node:16.17-alpine AS build-stage

COPY --chown=node:node package*.json ./

# ✅ Safe install
RUN npm install -g npm@9.4.0
RUN npm ci
COPY --chown=node:node ./src ./
COPY --chown=node:node ./*.json ./

RUN npm run build

# Run-time stage
FROM node:16.17-alpine AS run-stage
USER node

ARG PORT=3000
EXPOSE $PORT
WORKDIR /usr/src/app/

COPY --chown=node:node --from=build-stage node_modules ./node_modules
COPY --chown=node:node --from=build-stage dist package*.json ./

# ✅ Clean dev packages
RUN npm prune --production

CMD [ "node", "main.js" ]
