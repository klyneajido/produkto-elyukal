#!/bin/bash

# Colors
YELLOW='\033[1;33m'GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

prefix_output() {
    local prefix=$1
    local color=$2
    while IFS= read -r line; do
        echo -e "${color}${prefix}${NC} $line"
    done
}

# Start FastAPI server using app_venv
echo "Starting FastAPI..."
/app/app_venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload 2>&1 | prefix_output "[FastAPI]" "$YELLOW" &

# Start Rasa action server using chatbot_venv
echo "Starting Rasa actions..."
/app/chatbot_venv/bin/python -m rasa run actions --actions chatbot.actions --port 5056 2>&1 | prefix_output "[Actions]" "$GREEN" &

# Start Rasa server using chatbot_venv
echo "Starting Rasa server..."
/app/chatbot_venv/bin/python -m rasa run --enable-api --cors "*" --port 5055 --model /app/chatbot/models/20250417-194659-connected-asadero.tar.gz 2>&1 | prefix_output "[Rasa]" "$BLUE" &

# Wait for all background processes
wait