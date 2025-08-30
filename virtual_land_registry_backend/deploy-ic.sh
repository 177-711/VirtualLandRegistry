#!/bin/bash

echo "🌐 Deploying Virtual Land Registry to IC Mainnet..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if user has cycles
print_warning "Make sure you have sufficient cycles for deployment!"
print_warning "You'll need approximately 3-4 TC (trillion cycles) for initial deployment."
echo ""

# Confirm deployment
read -p "Are you sure you want to deploy to IC mainnet? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    print_error "Deployment cancelled."
    exit 0
fi

# Step 1: Build everything locally first
print_status "Building project locally..."
cd virtual_land_registry_frontend
npm install
npm run build
cd ..

# Step 2: Generate declarations
print_status "Generating declarations..."
dfx generate --network ic virtual_land_registry_backend

# Step 3: Copy declarations
print_status "Updating frontend with new declarations..."
cp -r .dfx/ic/canisters/virtual_land_registry_backend virtual_land_registry_frontend/src/declarations/

# Step 4: Rebuild frontend with IC declarations
print_status "Rebuilding frontend with IC configuration..."
cd virtual_land_registry_frontend
npm run build
cd ..

# Step 5: Deploy to IC
print_status "Deploying backend to IC..."
dfx deploy virtual_land_registry_backend --network ic --with-cycles 2000000000000

print_status "Deploying frontend to IC..."
dfx deploy virtual_land_registry_frontend --network ic

# Step 6: Show results
print_status "🎉 Deployment to IC Mainnet completed!"
echo ""
echo "📋 Production Deployment Summary:"
echo "================================="
echo "Backend Canister ID: $(dfx canister id virtual_land_registry_backend --network ic)"
echo "Frontend Canister ID: $(dfx canister id virtual_land_registry_frontend --network ic)"
echo ""
echo "🌐 Live URLs:"
echo "Frontend: https://$(dfx canister id virtual_land_registry_frontend --network ic).ic0.app"
echo "Backend Candid: https://$(dfx canister id virtual_land_registry_backend --network ic).ic0.app"
echo ""
echo "📊 Canister Status:"
dfx canister status --all --network ic
echo ""
print_status "Your Virtual Land Registry is now live on the Internet Computer! 🚀"