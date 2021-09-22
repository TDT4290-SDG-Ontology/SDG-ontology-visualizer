FROM node:14
EXPOSE 3001
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . .
ENTRYPOINT [ "yarn", "start" ]