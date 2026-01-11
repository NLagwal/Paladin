#!/bin/bash

# Kill background processes on exit
trap 'kill 0' SIGINT

echo "⚔️  Starting Paladin in Bare Metal Mode..."

check_permissions() {
    DIR=$1
    if [ -d "$DIR" ] && [ ! -w "$DIR" ]; then
        echo "❌ Error: $DIR is not writable (likely owned by root from Docker)."
        echo "   Please run: sudo rm -rf $DIR"
        exit 1
    fi
}

# 1. Start AI Service
echo "------------------------------------------------"
echo "[1/3] Starting AI Service (Python)..."
cd ai
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
echo "Installing/Updating Python dependencies..."
pip install -r requirements.txt

# Ensure config.toml exists
if [ ! -f "config.toml" ]; then
    cp config.example.toml config.toml
fi

uvicorn server:app --host 0.0.0.0 --port 8000 &
AI_PID=$!
cd ..

# 2. Start API Gateway
echo "------------------------------------------------"
echo "[2/3] Starting API Gateway (Node.js)..."
cd api-gateway
check_permissions "node_modules"
echo "Installing/Updating API Gateway dependencies..."
npm install

# Set env vars for gateway to find AI service locally
export AI_SERVICE_URL="http://localhost:8000"
export OLLAMA_BASE_URL="http://127.0.0.1:11434"
export PORT=5000
export API_GATEWAY_URL="http://localhost:5000" # For Vite Proxy
node src/index.js &
GATEWAY_PID=$!
cd ..

# 3. Start Frontend
echo "------------------------------------------------"
echo "[3/3] Starting Frontend (Vite)..."
cd frontend
check_permissions "node_modules"
echo "Installing/Updating Frontend dependencies..."
npm install

export VITE_API_URL="http://localhost:5000/api"
npm run dev -- --port 5173 &
FRONTEND_PID=$!
cd ..

echo "------------------------------------------------"
echo "✅ Paladin is running!"
echo "   - Frontend: http://localhost:5173"
echo "   - API Gateway: http://localhost:5000"
echo "   - AI Service: http://localhost:8000"
echo "Press Ctrl+C to stop all services."

wait
