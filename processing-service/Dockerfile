# Build stage
FROM python:3.9-slim as builder
WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip and install build tools
RUN pip install pip setuptools wheel --upgrade

# Install lighter dependencies first
RUN pip install pika==1.3.1 python-dotenv==1.0.0

# Install only required docling features
RUN pip install "docling[convert,chunk]==2.24.0" && \
    # Clean up to reduce image size
    find /opt/venv -name "*.pyc" -delete && \
    find /opt/venv -name "__pycache__" -delete && \
    rm -rf /root/.cache/pip

# Final stage
FROM python:3.9-slim
WORKDIR /app

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy source code
COPY src/ ./src/

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

CMD ["python", "src/main.py"]