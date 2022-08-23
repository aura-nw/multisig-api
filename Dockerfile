FROM node:16.13.2 as build-stage

WORKDIR /app

COPY package*.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn run build

FROM node:16.17-slim as run-stage

ARG PORT=3000
EXPOSE $PORT

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY --from=build-stage /app/dist /app/package.json /app/yarn.lock ./

CMD [ "node", "dist/app.js" ]
