FROM node:lts-alpine AS build-stage
WORKDIR /usr/src/app/
COPY package.json yarn.lock ./

RUN yarn install --ignore-scripts

COPY ./src ./src
COPY ./*.json ./

RUN yarn build:prod

FROM node:lts-alpine AS install-dependencies-stage
WORKDIR /usr/src/app/
COPY package.json yarn.lock ./

RUN yarn install --prod --ignore-scripts

# Run-time stage
FROM node:lts-alpine AS run-stage
USER node
ARG PORT=3000

WORKDIR /usr/src/app/

COPY --from=build-stage /usr/src/app/dist ./dist
COPY --from=install-dependencies-stage /usr/src/app/node_modules ./node_modules
COPY *.json /usr/src/app/

EXPOSE $PORT
CMD [ "yarn", "start:prod" ]
