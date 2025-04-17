# Use official Python image
FROM python:3.10-slim

# Set working directory to /app/server (since both Dockerfile and start-backend.sh are inside the server folder)
WORKDIR /app/server

# Copy everything from the server folder into the container
COPY server/ .

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Make sure the start-backend.sh script is executable
RUN chmod +x start-backend.sh

# Expose the necessary ports
EXPOSE 8000 5055 5056

# Run the start-backend.sh script
CMD ["bash", "run.sh"]
