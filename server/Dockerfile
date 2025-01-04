# Fetching the minified node image on apline linux
FROM node:20-slim

# Declaring env
ENV NODE_ENV development

# Setting up the work directory
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Exposing server port
EXPOSE 3000

# Starting our application
CMD [ "npm", "run", "dev" ]