FROM node:14
ENV DISABLE_ESLINT_PLUGIN=true
WORKDIR /app
COPY . .
RUN npm i --production
RUN npm run-script build

FROM node:14
COPY --from=0 /app/build /build
RUN npm i -g http-server
ENTRYPOINT [ "http-server", "build", "-p 80" ]