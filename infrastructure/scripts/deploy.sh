#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env

deploy_tracker() {
  echo "Deploying tracker to Cloudflare Pages..."
  cd packages/tracker
  pnpm build
  wrangler pages deploy dist --project-name traftics-tracker --branch main
  cd ../..
}

# Deploy web app to Vercel
deploy_web() {
  echo "Deploying web app to Vercel..."
  cd apps/web
  vercel deploy --prod
  cd ../..
}

deploy_docs() {
  echo "Deploying docs to Vercel..."
  cd docs
  vercel deploy --prod
  cd ..
}

# Main deployment logic
case "$1" in
  "tracker")
    deploy_tracker
    ;;
  "web")
    deploy_web
    ;;
  "docs")
    deploy_docs
    ;;
  "all")
    deploy_tracker
    deploy_web
    deploy_docs
    ;;
  *)
    echo "Usage: ./deploy.sh [tracker|web|docs|all]"
    exit 1
    ;;
esac 