#!/bin/bash

# Quick setup script to update API URLs for production deployment
# Usage: ./setup-production.sh YOUR_BACKEND_URL
# Example: ./setup-production.sh https://reektickets-production.up.railway.app

if [ -z "$1" ]; then
  echo "❌ Error: Please provide your Railway backend URL"
  echo "Usage: ./setup-production.sh YOUR_BACKEND_URL"
  echo "Example: ./setup-production.sh https://reektickets-production.up.railway.app"
  exit 1
fi

BACKEND_URL="$1"
API_URL="$BACKEND_URL/api"

echo "🔄 Updating API URLs to: $API_URL"

# Replace all hardcoded localhost:5000/api URLs
find src -type f \( -name "*.js" -o -name "*.jsx" \) -exec sed -i "s|http://localhost:5000/api|$API_URL|g" {} \;

# Update environment files
sed -i "s|REACT_APP_API_BASE=.*|REACT_APP_API_BASE=$API_URL|g" .env.production
sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=$API_URL|g" .env.production

echo "✅ API URLs updated successfully!"
echo ""
echo "📝 Updated files:"
echo "  - src/dashboards/*.jsx"
echo "  - src/pages/*.js"
echo "  - src/components/**/*.js"
echo "  - .env.production"
echo ""
echo "🚀 Next step: Deploy to Vercel"
echo "   npm run build && npx vercel --prod"
