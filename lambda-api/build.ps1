# Build and package Lambda function
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontend = Join-Path $scriptDir "..\Frontend"
$lambda   = $scriptDir

Write-Host "Building Lambda function..."

# Ensure frontend deps
Push-Location $frontend
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..."
    pnpm install
}
Pop-Location

# Compile TS (outDir = lambda-api/dist)
Push-Location $lambda
../Frontend/node_modules/.bin/tsc --project tsconfig.build.json

# Prepare output folders
New-Item -ItemType Directory -Path "server" -Force | Out-Null
New-Item -ItemType Directory -Path "lib" -Force | Out-Null

# Copy compiled files
Copy-Item -Path "dist\server\*" -Destination "server\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "dist\lib\*"    -Destination "lib\"    -Recurse -Force -ErrorAction SilentlyContinue

# Dependencies needed in Lambda
New-Item -ItemType Directory -Path "node_modules" -Force | Out-Null
Copy-Item -Path "$frontend\node_modules\@aws-sdk" -Destination ".\node_modules\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$frontend\node_modules\express"  -Destination ".\node_modules\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$frontend\node_modules\cors"     -Destination ".\node_modules\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$frontend\node_modules\dotenv"   -Destination ".\node_modules\" -Recurse -Force -ErrorAction SilentlyContinue
if (-not (Test-Path ".\node_modules\serverless-http")) {
    npm install serverless-http
}

# Package
if (Test-Path "function.zip") { Remove-Item "function.zip" -Force }
Compress-Archive -Path @("*.mjs","*.js","server","lib","node_modules","package.json") -DestinationPath "function.zip" -Force

Pop-Location
Write-Host "Done. Upload function.zip to Lambda."