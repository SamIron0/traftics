#!/bin/bash

# Build the tracker
cd packages/tracker
pnpm build

# Upload to S3
aws s3 cp dist/tracker.js s3://session-recorder-cdn/js/tracker.js

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E202403251234567890 \
  --paths "/js/tracker.js"