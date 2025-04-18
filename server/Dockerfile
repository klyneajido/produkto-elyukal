# Use official Python base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies for Rasa
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy your app and chatbot
COPY server/app/ ./app/
COPY server/chatbot/ ./chatbot/
COPY server/run.sh ./

# Create virtual environment for FastAPI and install dependencies
RUN python -m venv /app/app_venv \
    && /app/app_venv/bin/pip install --upgrade pip \
    && /app/app_venv/bin/pip install -r app/requirements.txt

# Create virtual environment for Rasa and install dependencies
RUN python -m venv /app/chatbot_venv \
    && /app/chatbot_venv/bin/pip install --upgrade pip \
    && /app/chatbot_venv/bin/pip install -r chatbot/requirements.txt

# Make the script executable
RUN chmod +x run.sh

# Expose necessary ports
EXPOSE 8000 5055 5056

# Start the backend script
CMD ["./run.sh"]