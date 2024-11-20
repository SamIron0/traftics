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
  wrangler pages deploy dist --project-name session-recorder-tracker --branch main
  cd ../..
}

deploy_player() {
  echo "Deploying player to npm..."
  cd packages/player
  pnpm build
  npm publish
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
  "player")
    deploy_player
    ;;
  "all")
    deploy_tracker
    deploy_web
    deploy_player
    ;;
  *)
    echo "Usage: ./deploy.sh [tracker|web|player|all]"
    exit 1
    ;;
esac 