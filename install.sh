#!/bin/bash

echo "🚀 Virtual Land Registry - Setup and Deployment Script"
echo "======================================================"

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ dfx is not installed. Please install dfinity SDK first."
    echo "Visit: https://internetcomputer.org/docs/current/developer-docs/setup/install/"
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Start local dfx network
echo "🔄 Starting local dfx network..."
dfx start --background --clean

# Wait for network to be ready
echo "⏳ Waiting for network to be ready..."
sleep 5

# Create canisters
echo "🔄 Creating canisters..."
dfx canister create --all

# Build backend
echo "🔄 Building backend canister..."
dfx build virtual_land_registry_backend

# Generate candid declarations
echo "🔄 Generating candid declarations..."
dfx generate virtual_land_registry_backend

# Install frontend dependencies
echo "🔄 Installing frontend dependencies..."
cd virtual_land_registry_frontend
npm install
cd ..

# Build and deploy backend
echo "🔄 Deploying backend canister..."
dfx deploy virtual_land_registry_backend

# Get canister IDs and update environment
echo "🔄 Setting up environment variables..."
BACKEND_CANISTER_ID=$(dfx canister id virtual_land_registry_backend)
INTERNET_IDENTITY_ID="rdmx6-jaaaa-aaaaa-aaadq-cai"

# Create/update .env file
cat > virtual_land_registry_frontend/.env << EOF
REACT_APP_VIRTUAL_LAND_REGISTRY_BACKEND_CANISTER_ID=${BACKEND_CANISTER_ID}
REACT_APP_INTERNET_IDENTITY_CANISTER_ID=${INTERNET_IDENTITY_ID}
REACT_APP_DFX_NETWORK=local
REACT_APP_HOST=http://localhost:4943
EOF

echo "📝 Environment file created with canister IDs"

# Build frontend
echo "🔄 Building frontend..."
cd virtual_land_registry_frontend
npm run build
cd ..

# Deploy frontend
echo "🔄 Deploying frontend canister..."
dfx deploy virtual_land_registry_frontend

# Display deployment info
echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "Backend Canister ID: ${BACKEND_CANISTER_ID}"
echo "Frontend URL: http://localhost:4943?canisterId=$(dfx canister id virtual_land_registry_frontend)"
echo "Internet Identity URL: http://localhost:4943?canisterId=${INTERNET_IDENTITY_ID}"
echo ""
echo "🔧 Useful Commands:"
echo "  dfx canister call virtual_land_registry_backend get_all_lands"
echo "  dfx canister call virtual_land_registry_backend get_land_statistics"
echo "  dfx logs virtual_land_registry_backend"
echo ""
echo "💡 To stop the local network: dfx stop"
echo "💡 To restart: dfx start --background"

# Function to deploy to mainnet
deploy_mainnet() {
    echo ""
    echo "🌐 Deploying to Mainnet"
    echo "======================"
    
    read -p "Are you sure you want to deploy to mainnet? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Deploying to mainnet..."
        
        # Create mainnet environment
        cat > virtual_land_registry_frontend/.env << EOF
REACT_APP_VIRTUAL_LAND_REGISTRY_BACKEND_CANISTER_ID=${BACKEND_CANISTER_ID}
REACT_APP_INTERNET_IDENTITY_CANISTER_ID=rdmx6-jaaaa-aaaaa-aaadq-cai
REACT_APP_DFX_NETWORK=ic
REACT_APP_HOST=https://ic0.app
EOF
        
        # Deploy to mainnet
        dfx deploy --network ic
        
        echo "🎉 Mainnet deployment complete!"
        echo "Frontend URL: https://$(dfx canister id virtual_land_registry_frontend --network ic).ic0.app"
    else
        echo "Mainnet deployment cancelled."
    fi
}

# Check if user wants to deploy to mainnet
echo ""
read -p "Do you want to deploy to mainnet as well? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    deploy_mainnet
fi

echo ""
echo "✅ Setup complete! Your Virtual Land Registry is ready to use."
echo "📱 Open the frontend URL in your browser to get started."