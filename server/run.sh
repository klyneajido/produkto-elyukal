#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

prefix_output() {
    local prefix=$1
    local color=$2
    while IFS= read -r line; do
        echo -e "${color}${prefix}${NC} $line"
    done
}

# Start FastAPI server
echo "Starting FastAPI..."
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload 2>&1 | prefix_output "[FastAPI]" "$RED" &

# Start Rasa action server
echo "Starting Rasa actions..."
python -m rasa run actions --actions chatbot.actions --port 5056 2>&1 | prefix_output "[Actions]" "$GREEN" &

# Start Rasa server
echo "Starting Rasa server..."
python -m rasa run --enable-api --cors "*" --port 5055 --model /app/chatbot/models/20250417-194659-connected-asadero.tar.gz 2>&1 | prefix_output "[Rasa]" "$BLUE" &

# Wait for all background processes
wait