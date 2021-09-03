FROM node:14
EXPOSE 3001
WORKDIR /app
COPY . .
RUN npm i
ENTRYPOINT [ "npm", "start" ]