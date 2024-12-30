# Fetching the minified node image on apline linux
FROM node:slim

# Declaring env
ENV NODE_ENV development

# Setting up the work directory
WORKDIR /app

# Copy only package.json and package-lock.json to leverage Docker's cache
COPY package*.json ./

# Installing dependencies
RUN npm install

# Copying all the files in our project
COPY . .

# Exposing server port
EXPOSE 8080

# Starting our application
CMD [ "npm", "run", "dev" ]