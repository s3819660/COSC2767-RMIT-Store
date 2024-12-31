# Fetching the minified node image on apline linux
# FROM node:20 AS builder
# ENV NODE_ENV development
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .


FROM node:20-slim
ENV NODE_ENV development
WORKDIR /app
COPY . /app/
EXPOSE 8080
CMD [ "npm", "run", "dev" ]