# SDG Ontology Visualizer

A tool for visualizing ontologies related to UN's sustainable development goals

[![Netlify Status](https://api.netlify.com/api/v1/badges/ae7d5c8b-7978-4f95-9b6b-fd1b40d40616/deploy-status)](https://app.netlify.com/sites/epic-ardinghelli-d1ee4d/deploys)

[![CI](https://github.com/ntnu-informatikk-2021/SDG-ontology-visualizer/actions/workflows/main.yml/badge.svg)](https://github.com/ntnu-informatikk-2021/SDG-ontology-visualizer/actions/workflows/main.yml)

[Deployed project](https://epic-ardinghelli-d1ee4d.netlify.app/)

## How to setup

1. Clone the repo
2. Run `yarn` in **both** backend and frontend folders
3. Create a file named _.env_ in the backend folder and paste your credentials as well as the IP of the server running GraphDB with port 7200. The structure of your _.env_ file can be copied from _.env.example_.
4. Run `yarn start` both in frontend and backend folders to start both the web application as well as the Express server.

## Setting up the dockerized environment

Prerequisites:

- Docker

- NodeJS

- Valid GraphDB license-file

### Backend

1. Make sure your Docker-daemon is running.

2. Place your `graphdb.license` file in `backend/database/conf`

3. Copy the `backend/.env.example`-file, and rename the copy `.env`

4. In `backend/`, run `docker-compose -f docker-compose-backend.yml up`

5. When the Docker-cluster is running, go to http://localhost:7200. On the left side of the screen, go to "Setup" and then "Users and Access". Click "Create new user" and make a user with credentials matching the `GRAPHDB_USERNAME` and `GRAPHDB_PASSWORD` fields in `backend/.env`. Make sure the user has Read-access to the TK_SDG-repository.

6. Stop the docker-compose cluster, and repeat step 4.

7. The backend should now be running, and accessible at http://localhost:3001

If you only want to run the GraphDB-database, replace `docker-compose-backend.yml` with `docker-compose-db.yml` in step 2.

### Frontend

1. Make sure the API is available on http://localhost:3001 (follow the steps above)

2. Copy the `frontend/.env.example`-file, and rename the copy `.env`

3. In `frontend/`, run `docker-compose up --build`

4. The app should now be accesible at https://localhost

### Frontend (development)

You can also develop using a devserver on a Docker container. It uses Docker-volumes to ensure that the container's workspace matches the codebase on your computer. This means that hot-reloading will work the same way as if you ran the devserver locally.

To use the development container, follow these steps:

1. Make sure the API is available on http://localhost:3001 (follow the steps above)

2. Copy the `frontend/.env.example`-file, and rename the copy `.env` (if you haven't done so already).

3. In `frontend/`, run `docker-compose -f docker-compose-dev.yml up --build`

4. The app should now be accesible at http://localhost:3000

### If changes are made to the ontology

Sometimes, changes to the `/backend/database/ontology/SDG_Ontology.owl` file are made. To implement these into your database, you have to do the following:

1. Before composing the backend Docker containers in Backend step 4, run `docker-compose -f docker-compose-backend.yml build --no-cache`.

This forces the containers to rebuild with the new ontology.

2. Continue with step 5 to 7 in the backend setup guide.
