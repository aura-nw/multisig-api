FROM node:lts-alpine AS build-stage
COPY package.json yarn.lock ./

RUN yarn install

COPY . ./

RUN yarn build:prod

FROM node:lts-alpine AS node_modules
COPY package.json yarn.lock ./

RUN yarn install --prod

# Run-time stage
FROM node:lts-alpine AS run-stage
ARG PORT=3000

WORKDIR /usr/src/app/

COPY --from=build-stage dist ./dist
COPY --from=node_modules node_modules ./node_modules
COPY . /usr/src/app/

EXPOSE $PORT
CMD [ "npm", "run", "start:prod" ]
