#!/bin/bash

# Complete fix for Nginx + SSL setup
# Run this on the server: ./complete-fix.sh

set -e

echo "🔧 Complete Nginx + SSL Fix Script"
echo "===================================="
echo ""

# Pull latest code
echo "📥 Pulling latest code..."
cd /root/hub-generic
git pull origin main

echo ""
echo "1️⃣ Stopping conflicting services..."
systemctl stop apache2 2>/dev/null || echo "Apache not running"
systemctl disable apache2 2>/dev/null || echo "Apache not installed"

echo ""
echo "2️⃣ Checking what's using ports..."
echo "Port 80:"
lsof -i :80 || echo "Nothing on port 80"
echo ""
echo "Port 443:"
lsof -i :443 || echo "Nothing on port 443"

echo ""
echo "3️⃣ Stopping Nginx if running..."
systemctl stop nginx 2>/dev/null || echo "Nginx not running"

echo ""
echo "4️⃣ Running fix-nginx.sh..."
chmod +x fix-nginx.sh
./fix-nginx.sh

echo ""
echo "5️⃣ Starting Nginx..."
systemctl start nginx
systemctl enable nginx

echo ""
echo "6️⃣ Starting application..."
pm2 start hub-generic

echo ""
echo "7️⃣ Checking status..."
echo "Nginx status:"
systemctl status nginx --no-pager | head -10
echo ""
echo "PM2 status:"
pm2 status

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Test your site:"
echo "   https://vilahub.co.uk"
echo ""
echo "🔍 If blank screen, check browser console (F12)"
echo "🔍 Check Nginx logs: tail -f /var/log/nginx/error.log"
echo "🔍 Check app logs: pm2 logs hub-generic"
