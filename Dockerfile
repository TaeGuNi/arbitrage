FROM node:20.11.1-alpine3.19 as build

WORKDIR /arbitrage

COPY package*.json ./

RUN npm install

COPY ./tsconfig.json ./
COPY ./src ./

RUN npm -v
RUN npm run build

FROM node:20.11.1-alpine3.19

WORKDIR /arbitrage
COPY package.json ./
COPY --from=build /arbitrage/build ./
RUN npm install --only=production

ENTRYPOINT ["node", "arbitrage.js"]
