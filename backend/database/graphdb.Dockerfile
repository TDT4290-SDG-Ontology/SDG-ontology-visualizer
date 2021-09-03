FROM ontotext/graphdb:9.9.0-se
EXPOSE 7200
RUN mkdir -p /opt/graphdb/dist/conf
COPY conf/ /opt/graphdb/dist/conf
COPY ontology/ /opt/graphdb/home/ontology
CMD ls /opt/graphdb/home/conf/
RUN /opt/graphdb/dist/bin/loadrdf -c /opt/graphdb/dist/conf/TK_SDG-config.ttl -m parallel /opt/graphdb/home/ontology