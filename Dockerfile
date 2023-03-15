FROM node:lts-alpine AS build-stage
WORKDIR /usr/src/app/
COPY --chown=node:node package.json yarn.lock ./

RUN yarn install

COPY --chown=node:node ./src ./src
COPY --chown=node:node ./*.json ./

RUN yarn build:prod

FROM node:lts-alpine AS install-dependencies-stage
WORKDIR /usr/src/app/
COPY --chown=node:node package.json yarn.lock ./

RUN yarn install --prod

# Run-time stage
FROM node:lts-alpine AS run-stage
USER node
ARG PORT=3000

WORKDIR /usr/src/app/

COPY --chown=node:node --from=build-stage /usr/src/app/dist ./dist
COPY --chown=node:node --from=install-dependencies-stage /usr/src/app/node_modules ./node_modules
COPY --chown=node:node *.json /usr/src/app/

EXPOSE $PORT
CMD [ "npm", "run", "start:prod" ]
