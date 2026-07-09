FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV WKD_DATA_DIR=/data

COPY package.json ./
COPY index.html README.md ./
COPY project ./project
COPY server ./server

RUN mkdir -p /data

EXPOSE 8080
VOLUME ["/data"]

CMD ["node", "server/src/index.js"]
