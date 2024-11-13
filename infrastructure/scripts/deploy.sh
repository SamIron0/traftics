#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env

deploy_tracker() {
  echo "Deploying tracker to Cloudflare Pages..."
  # Build dependencies first
  pnpm --filter @session-recorder/types build
  cd packages/tracker
  pnpm build
  wrangler pages deploy dist --project-name session-recorder-tracker
  cd ../..
}

# Deploy web app to Vercel
deploy_web() {
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
  "web")
    deploy_web
    ;;
  "all")
    deploy_tracker
    deploy_web
    ;;
  *)
    echo "Usage: ./deploy.sh [tracker|web|all]"
    exit 1
    ;;
esac 