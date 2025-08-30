#!/bin/bash

echo "🚀 Starting Virtual Land Registry Deployment Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "dfx.json" ]; then
    print_error "dfx.json not found. Please run this script from the project root directory."
    exit 1
fi

# Step 1: Clean previous builds
print_status "Cleaning previous builds..."
dfx stop
rm -rf .dfx
rm -rf virtual_land_registry_frontend/dist
rm -rf target

# Step 2: Start dfx local network
print_status "Starting local DFX network..."
dfx start --clean --background

# Wait for dfx to fully start
sleep 5

# Step 3: Install frontend dependencies
print_status "Installing frontend dependencies..."
cd virtual_land_registry_frontend
npm install

# Step 4: Generate candid declarations
print_status "Generating Candid declarations..."
cd ..
dfx generate virtual_land_registry_backend

# Step 5: Copy generated declarations to frontend
print_status "Copying declarations to frontend..."
mkdir -p virtual_land_registry_frontend/src/declarations
cp -r .dfx/local/canisters/virtual_land_registry_backend virtual_land_registry_frontend/src/declarations/

# Step 6: Build frontend
print_status "Building frontend..."
cd virtual_land_registry_frontend
npm run build

# Step 7: Deploy backend canister
print_status "Deploying backend canister..."
cd ..
dfx deploy virtual_land_registry_backend

# Step 8: Deploy frontend canister
print_status "Deploying frontend canister..."
dfx deploy virtual_land_registry_frontend

# Step 9: Get canister URLs
print_status "Deployment completed! 🎉"
echo ""
echo "📋 Deployment Summary:"
echo "======================="
echo "Backend Canister ID: $(dfx canister id virtual_land_registry_backend)"
echo "Frontend Canister ID: $(dfx canister id virtual_land_registry_frontend)"
echo ""
echo "🌐 Local URLs:"
echo "Frontend: http://$(dfx canister id virtual_land_registry_frontend).localhost:4943"
echo "Backend Candid UI: http://$(dfx canister id virtual_land_registry_backend).localhost:4943"
echo ""
echo "📊 Canister Status:"
dfx canister status --all
echo ""
print_status "Virtual Land Registry is now running locally!"
print_warning "Keep this terminal open to maintain the local network"