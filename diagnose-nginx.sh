#!/bin/bash

# Diagnose and fix Nginx startup issues

echo "🔍 Diagnosing Nginx startup issue..."
echo ""

# Check what's using port 80
echo "1️⃣ Checking what's using port 80..."
lsof -i :80 || netstat -tulpn | grep :80 || ss -tulpn | grep :80

echo ""
echo "2️⃣ Checking what's using port 443..."
lsof -i :443 || netstat -tulpn | grep :443 || ss -tulpn | grep :443

echo ""
echo "3️⃣ Checking Nginx status..."
systemctl status nginx --no-pager

echo ""
echo "4️⃣ Checking Nginx error log..."
tail -20 /var/log/nginx/error.log

echo ""
echo "5️⃣ Checking if Apache is running..."
systemctl status apache2 --no-pager 2>/dev/null || echo "Apache not installed or not running"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔧 SUGGESTED FIXES:"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "If Apache is running on port 80:"
echo "  systemctl stop apache2"
echo "  systemctl disable apache2"
echo ""
echo "If another process is using the port, kill it:"
echo "  kill -9 <PID>"
echo ""
echo "Then restart Nginx:"
echo "  systemctl start nginx"
echo ""
