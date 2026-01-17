#!/bin/bash

# Load environment variables from PM2 if available
if command -v pm2 &> /dev/null; then
  echo "🔍 Loading DATABASE_URL from PM2 environment..."
  export DATABASE_URL=$(pm2 env 0 | grep DATABASE_URL | cut -d'=' -f2-)
fi

# If DATABASE_URL is still not set, try to construct it from defaults
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not found in PM2, using default PostgreSQL connection..."
  export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hub_generic"
fi

echo "📊 Using DATABASE_URL: ${DATABASE_URL:0:20}..." # Show first 20 chars only for security

# Run the seed script
echo "🌱 Running seed script..."
npx tsx seed-site-content.ts

echo ""
echo "✅ Done! Now restart the app:"
echo "   pm2 restart hub-generic"
