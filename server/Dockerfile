FROM python:3.10-slim

WORKDIR /app

COPY server/ .

# Create virtual environment for app
RUN python -m venv /app/app_venv \
    && /app/app_venv/bin/pip install --upgrade pip \
    && /app/app_venv/bin/pip install -r app/requirements.txt

# Create virtual environment for chatbot
RUN python -m venv /app/chatbot_venv \
    && /app/chatbot_venv/bin/pip install --upgrade pip \
    && /app/chatbot_venv/bin/pip install -r chatbot/requirements.txt

RUN chmod +x run.sh

CMD ["./run.sh"]