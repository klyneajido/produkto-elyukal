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
COPY app/ ./app/
COPY chatbot/ ./chatbot/
COPY run.sh ./

# Install dependencies for FastAPI
RUN pip install --upgrade pip \
    && pip install -r app/requirements.txt

# Install dependencies for Rasa
RUN pip install -r chatbot/requirements.txt

# Make the script executable
RUN chmod +x run.sh

# Expose necessary ports
EXPOSE 8000 5055 5056

# Start the backend script
CMD ["./run.sh"]
