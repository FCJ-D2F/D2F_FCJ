#!/bin/bash
# Script to build and package Lambda function

set -e

echo "🔨 Building Lambda function..."

# Go to Frontend directory
cd ../Frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  pnpm install
fi

# Build TypeScript
echo "📝 Compiling TypeScript..."
npx tsc --project tsconfig.json --outDir ../lambda-api/dist

# Copy compiled files to lambda-api
echo "📋 Copying files..."
cp -r dist/server/* ../lambda-api/server/
cp -r dist/lib/* ../lambda-api/lib/ 2>/dev/null || true

# Copy node_modules (only what's needed)
echo "📦 Copying dependencies..."
mkdir -p ../lambda-api/node_modules
cp -r node_modules/@aws-sdk ../lambda-api/node_modules/ 2>/dev/null || true
cp -r node_modules/express ../lambda-api/node_modules/ 2>/dev/null || true
cp -r node_modules/cors ../lambda-api/node_modules/ 2>/dev/null || true
cp -r node_modules/dotenv ../lambda-api/node_modules/ 2>/dev/null || true
cp -r node_modules/serverless-http ../lambda-api/node_modules/ 2>/dev/null || true

# Go back to lambda-api
cd ../lambda-api

# Create zip file
echo "📦 Creating deployment package..."
zip -r function.zip . -x "*.git*" "*.md" "build.sh" "*.zip"

echo "✅ Build complete! Upload function.zip to Lambda"
echo "📦 File size: $(du -h function.zip | cut -f1)"


