# Uses the unlicensed tk_sdg_db, and adds a license to it before setting up the repository
FROM fredrbus/tk_sdg_db:1.1
ENV GDB_JAVA_OPTS="-Dgraphdb.license.file=/opt/graphdb/dist/license/graphdb.license"
COPY license/ /opt/graphdb/dist/license
RUN /opt/graphdb/dist/bin/loadrdf -c /opt/graphdb/dist/conf/TK_SDG-config.ttl -m parallel /opt/graphdb/home/ontology --force