FROM node:14
ENV DISABLE_ESLINT_PLUGIN=true
EXPOSE 3000
WORKDIR /app
COPY . .
RUN npm i --production
RUN npm i -g serve
RUN npm run-script build
ENTRYPOINT [ "serve", "-s", "build" ]