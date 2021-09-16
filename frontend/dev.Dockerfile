FROM node:14
ENV DISABLE_ESLINT_PLUGIN=true
WORKDIR /app
COPY package*.json ./
RUN npm i
CMD [ "npm", "start" ]