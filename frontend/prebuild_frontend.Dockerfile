FROM node:14
ENV DISABLE_ESLINT_PLUGIN=true
WORKDIR /app
COPY . .
RUN yarn --production