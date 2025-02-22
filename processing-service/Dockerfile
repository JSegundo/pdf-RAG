# Build stage
FROM python:3.9-slim as builder

WORKDIR /app

# Install only the required dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Final stage
FROM python:3.9-slim

WORKDIR /app

# Copy only the necessary files from builder
COPY --from=builder /usr/local/lib/python3.9/site-packages/ /usr/local/lib/python3.9/site-packages/
COPY src/ ./src/

CMD ["python", "src/main.py"] 