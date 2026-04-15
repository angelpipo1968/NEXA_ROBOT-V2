#!/bin/bash
set -euo pipefail

echo "🚀 Nexa AI deployment orchestrator"

echo "1/5 - Installing dependencies..."
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "2/5 - Running quality checks..."
npm run lint || echo "Lint warnings or failures detected"
npm run test -- --run || echo "Tests failed or are not configured"

echo "3/5 - Building application..."
npm run build

echo "4/5 - Deploying to Vercel with alias nexa-ai.dev..."
npm run deploy:vercel

if [ -n "${SUPABASE_PROJECT_ID:-}" ] && [ -n "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  echo "5/5 - Deploying Supabase..."
  bash ./deploy-supabase.sh
else
  echo "5/5 - Supabase deployment skipped because SUPABASE_PROJECT_ID or SUPABASE_ACCESS_TOKEN is not set."
fi

echo "✅ Deployment workflow finished."

echo "🔧 Recommended: configure VERCEL_TOKEN and SUPABASE_ACCESS_TOKEN as GitHub secrets for automated deployment."
