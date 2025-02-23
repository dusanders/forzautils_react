FROM node:18

WORKDIR /app

COPY package.json /app

COPY ./ /app
COPY ./ForzaTelemetryAPI_typescript /ForzaTelemetryAPI_typescript

RUN yarn install
RUN yarn build

EXPOSE 80
EXPOSE 81
EXPOSE 5200
WORKDIR /app/packages/server
CMD ["node", "dist/index.js"]