#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting complete test suite...${NC}\n"

# Cleanup function
cleanup() {
  echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
  
  # Kill Next.js dev server if running
  if [ ! -z "$NEXTJS_PID" ]; then
    echo "Stopping Next.js server (PID: $NEXTJS_PID)..."
    kill $NEXTJS_PID 2>/dev/null || true
  fi
  
  # Stop Docker services
  echo "Stopping Docker test services..."
  docker compose -f ../docker-compose.test.yaml down -v > /dev/null 2>&1 || true
  
  echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Step 1: Start Docker services
echo -e "${YELLOW}📦 Starting Docker test services...${NC}"
docker compose -f ../docker-compose.test.yaml up -d

# Step 2: Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 20

# Check if services are running
if ! docker compose -f ../docker-compose.test.yaml ps | grep -q "healthy"; then
  echo -e "${RED}❌ Docker services failed to start properly${NC}"
  docker compose -f ../docker-compose.test.yaml logs
  exit 1
fi

echo -e "${GREEN}✅ Docker services ready${NC}\n"

# Step 3: Start Next.js in test mode
echo -e "${YELLOW}🔧 Starting Next.js in test mode...${NC}"
NODE_ENV=test bun run next dev -p 3001 > /dev/null 2>&1 &
NEXTJS_PID=$!

# Wait for Next.js to be ready
echo -e "${YELLOW}⏳ Waiting for Next.js to be ready...${NC}"
for i in {1..30}; do
  if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Next.js ready${NC}\n"
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "${RED}❌ Next.js failed to start${NC}"
    exit 1
  fi
  sleep 1
done

# Step 4: Run tests
echo -e "${GREEN}🧪 Running all tests...${NC}\n"
bun test

# If we get here, tests passed
echo -e "\n${GREEN}✅ All tests passed!${NC}"
exit 0
