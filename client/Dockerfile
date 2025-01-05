# Fetching the minified node image on apline linux
# FROM node:20 AS builder
# ENV NODE_ENV development
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .


# FROM node:20-slim
# # ENV NODE_ENV development
# WORKDIR /app
# COPY . ./
# EXPOSE 9090
# CMD [ "npm", "run", "dev" ]


# ==== solution 2 ====
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "run", "dev"]

