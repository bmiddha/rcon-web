FROM node:14-alpine

WORKDIR /usr/src/app

COPY yarn.lock package.json ./
COPY server/package.json server/
COPY client/package.json client/

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 8080
CMD [ "yarn", "start" ]
