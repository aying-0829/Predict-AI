# syntax=docker/dockerfile:1
FROM node:22-slim

ENV PUPPETEER_SKIP_DOWNLOAD=true

# better-sqlite3 build dependencies
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
