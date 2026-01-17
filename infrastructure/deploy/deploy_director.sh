#!/bin/bash
# Deploy Director Dashboard to Hetzner
# Run this ON the Hetzner server after syncing the codebase

set -e

PROJECT_DIR="/root/downstream.ink"
DIRECTOR_DIR="$PROJECT_DIR/infrastructure/director"
VENV_DIR="$DIRECTOR_DIR/.venv"

echo "=== Deploying Director Dashboard ==="

# 1. Create logs directory
mkdir -p "$PROJECT_DIR/logs"

# 2. Create virtual environment if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv "$VENV_DIR"
fi

# 3. Install Python dependencies in venv
echo "Installing Python dependencies..."
cd "$DIRECTOR_DIR"
"$VENV_DIR/bin/pip" install -r requirements.txt --quiet

# 4. Initialize database if needed
echo "Initializing database..."
"$VENV_DIR/bin/python" -c "import auth; auth.init_db()" 2>/dev/null || true

# 5. Copy systemd service
echo "Installing systemd service..."
cp "$PROJECT_DIR/infrastructure/deploy/director.service" /etc/systemd/system/
systemctl daemon-reload

# 6. Copy nginx config (HTTP-only first if no SSL cert exists)
echo "Installing nginx config..."
if [ ! -f /etc/letsencrypt/live/director.downstream.studio/fullchain.pem ]; then
    # Use HTTP-only config initially
    cp "$PROJECT_DIR/infrastructure/deploy/director.nginx.http.conf" /etc/nginx/sites-available/director
else
    # Use full SSL config if cert exists
    cp "$PROJECT_DIR/infrastructure/deploy/director.nginx.conf" /etc/nginx/sites-available/director
fi
ln -sf /etc/nginx/sites-available/director /etc/nginx/sites-enabled/

# 7. Test and reload nginx for HTTP
echo "Testing nginx config..."
nginx -t
systemctl reload nginx

# 8. Get SSL certificate if needed
if [ ! -f /etc/letsencrypt/live/director.downstream.studio/fullchain.pem ]; then
    echo "Getting SSL certificate..."
    certbot --nginx -d director.downstream.studio --non-interactive --agree-tos -m admin@downstream.ink
fi

# 9. Install full SSL nginx config after cert is obtained
echo "Installing final nginx config with SSL..."
cp "$PROJECT_DIR/infrastructure/deploy/director.nginx.conf" /etc/nginx/sites-available/director

# 10. Test nginx config
echo "Testing nginx config..."
nginx -t

# 11. Start/restart services
echo "Starting services..."
systemctl enable director
systemctl restart director
systemctl reload nginx

# 12. Verify
sleep 2
echo ""
echo "=== Deployment Complete ==="
echo "Director status: $(systemctl is-active director)"
echo ""
curl -s http://127.0.0.1:8080/health || echo "Health check pending..."
echo ""
echo "Dashboard should be available at: https://director.downstream.studio"
