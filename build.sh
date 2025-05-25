#!/bin/bash

# Print commands and their arguments as they are executed
set -x

echo "🏗️  Building Full Stack Application..."

# Navigate to client directory and build
echo "📦 Building Client Application..."
cd client
npm install
npm run build

# Navigate back to root and then to server directory
echo "🚀 Building Server Application..."
cd ../server
npm install
npm run build

echo "✅ Build Complete!"

# Return to the root directory
cd ..
