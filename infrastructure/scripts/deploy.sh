#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env

# Deploy tracker to Cloudflare Pages
deploy_tracker() {
  echo "Deploying tracker to Cloudflare Pages..."
  cd packages/tracker
  pnpm build
  wrangler pages deploy dist --project-name session-recorder-tracker
  cd ../..
}

# Deploy web app to Vercel
deploy_app() {
  echo "Deploying web app to Vercel..."
  cd apps/web
  vercel deploy --prod
  cd ../..
}

# Main deployment logic
case "$1" in
  "tracker")
    deploy_tracker
    ;;
  "app")
    deploy_app
    ;;
  "all")
    deploy_tracker
    deploy_app
    ;;
  *)
    echo "Usage: ./deploy.sh [tracker|app|all]"
    exit 1
    ;;
esac 