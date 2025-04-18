#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to add colored prefix to output
prefix_output() {
    local prefix=$1
    local color=$2
    while IFS= read -r line; do
        echo -e "${color}${prefix}${NC} $line"
    done
}

# ---- Start FastAPI ----
echo "Starting FastAPI..."

cd app
./venv/Scripts/activate && \
./venv/Scripts/python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload 2>&1 | prefix_output "[FastAPI]" "$RED" &
cd ..

# ---- Start Rasa ----
echo "Starting Rasa..."

cd chatbot
./venv/Scripts/activate && \
./venv/Scripts/rasa run actions --port 5056 2>&1 | prefix_output "[Actions]" "$GREEN" &
./venv/Scripts/rasa run --enable-api --cors "*" --port 5055 2>&1 | prefix_output "[Rasa]" "$BLUE" &
cd ..

# Wait for all background processes
wait
