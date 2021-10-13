#!/bin/sh
# await_login.sh

set -e

host="$1"
logged_in="false"

shift


until [ $logged_in = "true" ]
do
  logged_in=$(curl -s http://$host:3001/api/isLoggedIn) || logged_in="false"
  sleep 1
done
  
>&2 echo "\n\nAPI is logged in, continuing..\n"
exec "$@"
