#!/bin/bash

# SSL Setup Script for vilahub.co.uk
# This script installs Nginx, Certbot, and configures HTTPS

set -e

echo "🔐 Setting up HTTPS for vilahub.co.uk"
echo "========================================"
echo ""

# Check if domain is resolving
echo "📡 Checking DNS resolution..."
if ! ping -c 1 vilahub.co.uk &> /dev/null; then
    echo "❌ WARNING: vilahub.co.uk is not resolving to this server yet!"
    echo "Please configure DNS first and wait for propagation."
    echo "Check: https://dnschecker.org/#A/vilahub.co.uk"
    exit 1
fi

echo "✅ DNS is resolving correctly"
echo ""

# Update system
echo "📦 Updating system packages..."
apt update
apt upgrade -y

# Install Nginx
echo "📦 Installing Nginx..."
apt install -y nginx

# Install Certbot
echo "📦 Installing Certbot (Let's Encrypt client)..."
apt install -y certbot python3-certbot-nginx

# Stop PM2 temporarily to free port 80
echo "🛑 Stopping application temporarily..."
pm2 stop hub-generic || true

# Stop Nginx temporarily
systemctl stop nginx

# Create Nginx configuration
echo "📝 Creating Nginx configuration..."
cat > /etc/nginx/sites-available/vilahub.co.uk << 'NGINX_CONFIG'
server {
    listen 80;
    server_name vilahub.co.uk www.vilahub.co.uk;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_CONFIG

# Enable site
ln -sf /etc/nginx/sites-available/vilahub.co.uk /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🔍 Testing Nginx configuration..."
nginx -t

# Start Nginx
echo "▶️  Starting Nginx..."
systemctl start nginx
systemctl enable nginx

# Obtain SSL certificate
echo "🔐 Obtaining SSL certificate from Let's Encrypt..."
certbot --nginx -d vilahub.co.uk -d www.vilahub.co.uk --non-interactive --agree-tos --email admin@vilahub.co.uk --redirect

# Start application
echo "▶️  Starting application..."
pm2 start hub-generic

echo ""
echo "✅ HTTPS setup complete!"
echo ""
echo "🌐 Your site is now available at:"
echo "   https://vilahub.co.uk"
echo "   https://www.vilahub.co.uk"
echo ""
echo "📋 Next steps:"
echo "   1. Test: https://vilahub.co.uk"
echo "   2. Certificate auto-renewal is configured"
echo "   3. Update site config to use new domain"
echo ""
echo "🔄 Certificate renewal:"
echo "   Certbot will automatically renew your certificate"
echo "   Test renewal: certbot renew --dry-run"
