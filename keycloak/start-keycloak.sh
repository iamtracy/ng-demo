#!/bin/bash

echo "starting keycloak on port ${KC_HTTP_PORT}"

exec /opt/keycloak/bin/kc.sh start \
  --db-password="${KC_DB_PASSWORD}" \
  --db-schema="public" \
  --db-url-database="keycloak" \
  --db-url-host="${KC_DB_URL_HOST}" \
  --db-url-port="5432" \
  --db-username="${KC_DB_USERNAME}" \
  --db="${KC_DB}" \
  --health-enabled=true \
  --hostname-strict=true \
  --hostname="${KC_HOSTNAME}" \
  --http-port="${KC_HTTP_PORT}" \
  --log-level="${KC_LOG_LEVEL}"  \
  --proxy-headers=xforwarded