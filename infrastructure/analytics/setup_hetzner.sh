#!/bin/bash
# Analytics API Setup for Hetzner
# Run this once on the server after git pull

set -e

PROJECT_DIR="/root/downstream.ink"
cd "$PROJECT_DIR"

echo "=== Setting up DownStream Analytics ==="

# 1. Install Python dependencies
echo "Installing Python packages..."
pip3 install fastapi uvicorn pydantic -q

# 2. Create database directory
echo "Creating database directory..."
mkdir -p /var/lib/downstream

# 3. Make scripts executable
chmod +x ./infrastructure/analytics/*.sh

# 4. Initialize database
echo "Initializing database..."
sqlite3 /var/lib/downstream/analytics.db < ./infrastructure/analytics/schema.sql

# 5. Start API
echo "Starting analytics API..."
./infrastructure/analytics/start_analytics.sh --daemon

# 6. Verify
sleep 2
if curl -s http://localhost:8082/health | grep -q "healthy"; then
    echo "API is running!"
else
    echo "WARNING: API health check failed"
fi

# 7. Check if nginx config needed
if ! grep -q "analytics.downstream.ink" /etc/nginx/sites-enabled/* 2>/dev/null; then
    echo ""
    echo "=== MANUAL STEP REQUIRED ==="
    echo "Add this to your nginx config:"
    echo ""
    cat << 'NGINX'
server {
    listen 443 ssl;
    server_name analytics.downstream.ink;

    ssl_certificate /etc/letsencrypt/live/downstream.ink/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/downstream.ink/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX
    echo ""
    echo "Then run: nginx -t && nginx -s reload"
else
    echo "Nginx config already exists for analytics.downstream.ink"
fi

echo ""
echo "=== Setup complete ==="
echo "Dashboard: https://analytics.downstream.ink/dashboard"
