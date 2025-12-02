#!/bin/bash

set -e

echo "🚀 Deploying IP Credit Stack - Production Mode"

if [ -z "$RPC_URL" ]; then
    echo "❌ ERROR: RPC_URL environment variable is required"
    exit 1
fi

if [ -z "$IDENTITY_REGISTRY" ]; then
    echo "⚠️ WARNING: IDENTITY_REGISTRY not set - compliance features will be disabled"
fi

mkdir -p audit_logs backups

echo "📦 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

echo "🏥 Performing health check..."
curl -f http://localhost:8000/health || {
    echo "❌ Health check failed"
    docker-compose logs
    exit 1
}

echo "✅ Deployment completed successfully"
echo "📊 API available at: http://localhost:8000"
echo "📚 API documentation: http://localhost:8000/docs"
echo "🔍 Health endpoint: http://localhost:8000/health"

echo ""
echo "📋 Service Status:"
docker-compose ps
