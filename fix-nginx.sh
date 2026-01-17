#!/bin/bash

# Fix Nginx configuration for vilahub.co.uk
# This resolves blank screen / CORS issues

echo "🔧 Fixing Nginx configuration..."

# Create proper Nginx configuration
cat > /etc/nginx/sites-available/vilahub.co.uk << 'NGINX_CONFIG'
server {
    listen 80;
    listen [::]:80;
    server_name vilahub.co.uk www.vilahub.co.uk;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name vilahub.co.uk www.vilahub.co.uk;

    # SSL Configuration (Certbot will manage these)
    ssl_certificate /etc/letsencrypt/live/vilahub.co.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vilahub.co.uk/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy settings
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Disable caching for API requests
        proxy_cache_bypass $http_upgrade;
        proxy_no_cache $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Static files with caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:5000;
        proxy_cache_valid 200 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers for API
        add_header 'Access-Control-Allow-Origin' 'https://vilahub.co.uk' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
        
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # Health check
    location /health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }
}
NGINX_CONFIG

echo "✅ Nginx configuration created"

# Test configuration
echo "🔍 Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    # Reload Nginx
    echo "🔄 Reloading Nginx..."
    systemctl reload nginx
    
    echo ""
    echo "✅ Nginx configuration updated!"
    echo ""
    echo "🌐 Your site should now work at:"
    echo "   https://vilahub.co.uk"
    echo ""
    echo "🔍 If you still see blank screen:"
    echo "   1. Check browser console (F12) for errors"
    echo "   2. Check Nginx logs: tail -f /var/log/nginx/error.log"
    echo "   3. Check app is running: pm2 status"
    echo "   4. Check app logs: pm2 logs hub-generic"
else
    echo "❌ Nginx configuration test failed!"
    echo "Please check the error above"
    exit 1
fi
