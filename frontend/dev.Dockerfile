FROM node:14
ENV DISABLE_ESLINT_PLUGIN=true
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN yarn
CMD [ "yarn", "start" ]