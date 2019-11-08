FROM node:12

WORKDIR /app

COPY . .

RUN npm install -g yarn
RUN yarn && yarn build

EXPOSE 8080
CMD [ "yarn", "start" ]
