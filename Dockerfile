FROM node:18.12.1-alpine

WORKDIR /home/node/app

COPY package.json ./

RUN npm install yarn
RUN yarn

COPY . .

RUN yarn build