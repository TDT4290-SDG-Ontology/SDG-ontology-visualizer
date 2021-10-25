FROM node:14
ENV DISABLE_ESLINT_PLUGIN=true
WORKDIR /app
COPY .. .
RUN yarn --production

FROM node:14
COPY --from=0 /app .
RUN yarn add global http-server
RUN yarn run build
CMD [ "http-server", "build", "-p 80" ]