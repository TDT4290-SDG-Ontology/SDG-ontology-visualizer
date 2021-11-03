FROM fredrbus/tk_sdg_frontend:1.1
ENV REACT_APP_BACKEND_URL="http://stud211001.idi.ntnu.no:3001/api"
WORKDIR /app
RUN yarn global add http-server
RUN yarn run build
CMD [ "http-server", "build", "-p 80" ]