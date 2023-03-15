FROM node:lts-alpine AS build-stage
WORKDIR /usr/src/app/
COPY --chown=node:node package.json yarn.lock ./

RUN yarn install

COPY --chown=node:node ./src ./src
COPY --chown=node:node ./*.json ./

RUN yarn build:prod

FROM node:lts-alpine AS run-stage
USER node
WORKDIR /usr/src/app/
ARG PORT=3000
COPY --chown=node:node package.json yarn.lock ./

RUN yarn install --prod

COPY --chown=node:node --from=build-stage dist ./dist
COPY --chown=node:node *.json /usr/src/app/
EXPOSE $PORT
CMD [ "npm", "run", "start:prod" ]