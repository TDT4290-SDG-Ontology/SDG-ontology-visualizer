# This has to be licensed manually from the workbench
# Safe to push to Docker Hub
FROM ontotext/graphdb:9.9.0-se
EXPOSE 7200
RUN mkdir -p /opt/graphdb/dist/conf
COPY conf/TK_SDG-config.ttl /opt/graphdb/dist/conf/TK_SDG-config.ttl
COPY ontology/ /opt/graphdb/home/ontology