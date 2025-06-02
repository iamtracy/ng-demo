#!/bin/bash

export PORT=${PORT:-3000}

echo "Starting application on port ${PORT}"

exec node dist/src/main.js 