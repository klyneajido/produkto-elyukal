#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to add colored prefix to output
prefix_output() {
    local prefix=$1
    local color=$2
    while IFS= read -r line; do
        echo -e "${color}${prefix}${NC} $line"
    done
}

# Navigate to server directory
cd "$(dirname "$0")"

# Start Uvicorn server for FastAPI
echo "Starting Uvicorn server..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload 2>&1 | prefix_output "[FastAPI]" "$RED" &

# Navigate to chatbot directory
cd chatbot

# Start Rasa action server
echo "Starting Rasa action server..."
rasa run actions --port 5056 2>&1 | prefix_output "[Actions]" "$GREEN" &

# Start Rasa server with REST API
echo "Starting Rasa server..."
rasa run --enable-api --cors "*" --port 5055 2>&1 | prefix_output "[Rasa]" "$BLUE" &

# Wait for all background processes to finish
wait
