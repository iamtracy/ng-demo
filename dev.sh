#!/bin/bash

# Print commands and their arguments as they are executed
set -x

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "    🚀 MISSION CONTROL INITIATED 🚀"
echo "    =================================="
echo "         🌌 SPACE DEV STATION 🌌"
echo "    =================================="
echo -e "${NC}"

echo -e "${YELLOW}🛰️  Initializing orbital development servers...${NC}"

# Function to cleanup background processes on script exit
cleanup() {
  echo -e "${RED}"
  echo "    🛑 MISSION ABORT SEQUENCE INITIATED 🛑"
  echo "    ======================================="
  echo "    🌍 Returning to Earth... Safe landing! 🌍"
  echo -e "${NC}"
  kill $(jobs -p)
  exit 0
}

# Set up cleanup on script exit
trap cleanup EXIT

# Function to run client with colored prefix
run_client() {
  cd client
  npm run start 2>&1 | sed "s/^/$(echo -e "${CYAN}[🌟 CLIENT]${NC}") /"
}

# Function to run server with colored prefix
run_server() {
  cd server
  echo -e "${PURPLE}[🔧 SERVER] Generating Prisma client...${NC}"
  npm run prisma:generate 2>&1 | sed "s/^/$(echo -e "${PURPLE}[🔧 SERVER]${NC}") /"
  echo -e "${PURPLE}[🔧 SERVER] Running database migrations...${NC}"
  npm run prisma:migrate 2>&1 | sed "s/^/$(echo -e "${PURPLE}[🔧 SERVER]${NC}") /"
  echo -e "${PURPLE}[🔧 SERVER] Launching NestJS rocket...${NC}"
  npm run start:dev 2>&1 | sed "s/^/$(echo -e "${PURPLE}[🚀 SERVER]${NC}") /"
}

echo -e "${CYAN}🌟 Launching Frontend Spacecraft...${NC}"
echo -e "${PURPLE}🚀 Igniting Backend Rocket Engines...${NC}"
echo -e "${GREEN}🛸 Both vessels are preparing for launch...${NC}"
echo ""

# Run both in parallel with output prefixes
run_client &
CLIENT_PID=$!

run_server &
SERVER_PID=$!

echo -e "${YELLOW}⭐ Mission Status: BOTH SPACECRAFT LAUNCHED ⭐${NC}"
echo -e "${GREEN}🌌 Monitoring space communications...${NC}"
echo -e "${BLUE}📡 Press Ctrl+C to initiate landing sequence${NC}"
echo ""

# Wait for both processes
wait $CLIENT_PID $SERVER_PID 