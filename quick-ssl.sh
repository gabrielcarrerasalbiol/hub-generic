#!/bin/bash

# Quick fix: HTTP first, then SSL
# This avoids the missing SSL files error

echo "🔧 Quick Setup: HTTP first, then SSL..."
echo ""

# Stop Nginx
systemctl stop nginx 2>/dev/null

# Create simple HTTP-only config
cat > /etc/nginx/sites-available/vilahub.co.uk << 'NGINX_CONFIG'
server {
    listen 80;
    listen [::]:80;
    server_name vilahub.co.uk www.vilahub.co.uk;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }
}
NGINX_CONFIG

# Enable site
ln -sf /etc/nginx/sites-available/vilahub.co.uk /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and start
nginx -t && systemctl start nginx && systemctl enable nginx

# Start app
pm2 start hub-generic 2>/dev/null || pm2 restart hub-generic

echo ""
echo "✅ HTTP working! Now getting SSL..."
echo ""

# Get SSL certificate
certbot --nginx -d vilahub.co.uk -d www.vilahub.co.uk --non-interactive --agree-tos --email admin@vilahub.co.uk --redirect

echo ""
echo "✅ Complete! Visit: https://vilahub.co.uk"
