#!/bin/bash

# Print commands as they are executed
set -x

# Douglas Adams-themed terminal colors
IMPROBABILITY='\033[38;5;57m'
HYPERINTELLIGENT='\033[38;5;135m'
PANIC='\033[1;91m'
TOWEL='\033[1;97m'
CUP_OF_TEA='\033[1;96m'
SARCASM='\033[1;90m'
NC='\033[0m' # Reset

# Opening transmission
echo -e "\n${IMPROBABILITY}"
echo "    ╔════════════════════════════════════════╗"
echo "    ║     GALACTIC DEV LAUNCH SYSTEM         ║"
echo "    ╠════════════════════════════════════════╣"
echo "    ║    🚀 Powered by Infinite Improbability ║"
echo "    ║    🪐 Consult your towel before launch  ║"
echo "    ╚════════════════════════════════════════╝"
echo -e "${TOWEL}              🚨 DON'T PANIC 🚨${NC}\n"

echo -e "${CUP_OF_TEA}[☕] Brewing digital tea and warming up servers...${NC}\n"

# Cleanup on Ctrl+C
cleanup() {
    echo -e "\n${PANIC}"
    echo "    ╔════════════════════════════════════════╗"
    echo "    ║     ✴️  Emergency Protocols Activated    ║"
    echo "    ╠════════════════════════════════════════╣"
    echo "    ║     🛬 Returning to Earth (or Magrathea) ║"
    echo "    ╚════════════════════════════════════════╝"
    echo -e "${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup EXIT

# Launch client (the frontend component, not the squishy biological one)
echo -e "${HYPERINTELLIGENT}[🌍] Engaging Frontend Neural Interface...${NC}"
cd client
echo -e "${HYPERINTELLIGENT}[📦] Installing improbably necessary packages...${NC}"
npm install
echo -e "${HYPERINTELLIGENT}[🪐] Engaging launch thrusters...${NC}"
npm run start 2>&1 | sed "s/^/$(printf "${IMPROBABILITY}[CLIENT]${NC} ") /" &
CLIENT_PID=$!
cd ..

# Launch server (it definitely knows where its towel is)
echo -e "\n${HYPERINTELLIGENT}[🧠] Awakening Backend Intelligence Core...${NC}"
cd server
echo -e "${HYPERINTELLIGENT}[📦] Installing alien dependencies...${NC}"
npm install --force
echo -e "${HYPERINTELLIGENT}[🧬] Generating Prisma from improbable atoms...${NC}"
npm run prisma:generate
echo -e "${HYPERINTELLIGENT}[📡] Broadcasting schema to the galaxy...${NC}"
npm run prisma:migrate
echo -e "${HYPERINTELLIGENT}[🚀] Launching NestJS Hyperdrive...${NC}"
npm run start:dev 2>&1 | sed "s/^/$(printf "${IMPROBABILITY}[SERVER]${NC} ") /" &
SERVER_PID=$!
cd ..

# Mission status
echo -e "\n${TOWEL}[✨] Status: All Systems Go (unless the Vogons are involved)${NC}"
echo -e "${SARCASM}[📡] Monitoring transmissions from both ends of the improbability curve...${NC}"
echo -e "${CUP_OF_TEA}[🧭] Press Ctrl+C to dematerialize gracefully${NC}\n"

# Wait for the absurdity to stabilize
wait $CLIENT_PID $SERVER_PID
