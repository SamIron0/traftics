#!/bin/bash

# Build the tracker
cd packages/tracker
pnpm build

# Deploy to Vercel
vercel deploy dist/tracker.js --prod