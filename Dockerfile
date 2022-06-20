FROM node:16.13.2 as build-stage

ARG PORT=3000

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .
RUN yarn install 
# RUN npm run build

EXPOSE $PORT

CMD [ "yarn", "start" ]
