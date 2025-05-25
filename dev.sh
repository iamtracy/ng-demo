#!/bin/bash

# Print commands and their arguments as they are executed
set -x

echo "🚀 Starting Development Servers..."

# Function to cleanup background processes on script exit
cleanup() {
  echo "🛑 Stopping all servers..."
  kill $(jobs -p)
  exit 0
}

# Set up cleanup on script exit
trap cleanup EXIT

# Start the client application in the background
echo "📱 Starting Client Application..."
cd client
npm run start &

# Wait a bit to let the client start
sleep 2

# Start the server application in the background
echo "🖥️  Starting Server Application..."
cd ../server
npm run start:dev &

# Keep the script running
wait 