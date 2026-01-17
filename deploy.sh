#!/bin/bash

# Secure deployment script for hub-generic
# Uses SSH key authentication (no password needed)

echo "🚀 Starting deployment to production..."
echo ""

# Connect to server and deploy
ssh root@82.165.196.49 << 'ENDSSH'
set -e

echo "📂 Navigating to project directory..."
cd /root/hub-generic

echo "📥 Pulling latest changes from GitHub..."
git pull origin main

echo "🛑 Stopping application..."
pm2 stop hub-generic

echo "📦 Building application..."
npm run build

echo "▶️  Starting application..."
pm2 start ecosystem.config.cjs

echo "💾 Saving PM2 configuration..."
pm2 save

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Application status:"
pm2 status

ENDSSH

echo ""
echo "🎉 Deployment finished!"
echo "🌐 Application: http://82.165.196.49:5000"
