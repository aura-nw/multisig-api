FROM node:16.13.2 as build-stage

WORKDIR /app

COPY package*.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn run build

FROM node:16.17-slim as run-stage
USER node

ARG PORT=3000
EXPOSE $PORT

COPY --chown=node:node --from=build-stage /app/node_modules ./node_modules
COPY --chown=node:node --from=build-stage /app/dist /app/package.json /app/yarn.lock ./


CMD [ "node", "src/main.js" ]
