#!/bin/bash

export DATABASE_URL="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/ng_demo_db?sslmode=no-verify"

echo "Starting application with DATABASE_URL: ${DATABASE_URL}"

exec node dist/src/main.js 