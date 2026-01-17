#!/bin/bash

echo "🔍 Loading environment variables..."

# Try to load from .env.production if exists
if [ -f ".env.production" ]; then
  echo "📝 Loading from .env.production..."
  export $(cat .env.production | grep -v '^#' | grep -v '^$' | xargs)
fi

# Try to load from .env if exists  
if [ -f ".env" ]; then
  echo "📝 Loading from .env..."
  export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
fi

# Check if DATABASE_URL or PROD_DATABASE_URL is set
if [ -z "$DATABASE_URL" ] && [ -z "$PROD_DATABASE_URL" ]; then
  echo ""
  echo "❌ ERROR: No DATABASE_URL found!"
  echo ""
  echo "Please set DATABASE_URL or PROD_DATABASE_URL in one of:"
  echo "  • .env.production"
  echo "  • .env"
  echo "  • Environment variable"
  echo ""
  echo "Example:"
  echo "  export DATABASE_URL='postgresql://user:pass@host.neon.tech/dbname?sslmode=require'"
  echo ""
  exit 1
fi

# Use PROD_DATABASE_URL if DATABASE_URL is not set
if [ -z "$DATABASE_URL" ] && [ -n "$PROD_DATABASE_URL" ]; then
  export DATABASE_URL="$PROD_DATABASE_URL"
  echo "✅ Using PROD_DATABASE_URL as DATABASE_URL"
fi

echo "📊 Database host: $(echo $DATABASE_URL | grep -oP '(?<=@)[^:]+' || echo 'localhost')"

# Run the seed script
echo ""
echo "🌱 Running seed script..."
npx tsx seed-site-content.ts

echo ""
echo "✅ Done! Now restart the app:"
echo "   pm2 restart hub-generic"
