FROM node:16.17.0

ARG PORT

ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
RUN npm i -g @nestjs/cli

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Build
RUN npm run build
EXPOSE $PORT

CMD [ "npm", "run","start:prod" ]