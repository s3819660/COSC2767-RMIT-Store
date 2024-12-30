# Fetching the minified node image on apline linux
FROM node:slim

# Declaring env
ENV NODE_ENV development

# Setting up the work directory
WORKDIR /app

# Copying all the files in our project
COPY package*.json ./
COPY . .

# Installing dependencies
RUN npm install

# Exposing server port
EXPOSE 8080

# Starting our application
CMD [ "npm", "run", "dev" ]