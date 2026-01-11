#!/bin/bash

# Kill background processes on exit
trap 'kill 0' SIGINT

echo "🎭 Starting Paladin in DEMO MODE..."
echo "------------------------------------------------"
echo "NOTE: This mode runs ONLY the Frontend with Mock Data."
echo "      No AI Service or API Gateway will be started."
echo "------------------------------------------------"

# 3. Start Frontend
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing Frontend dependencies..."
    npm install
fi

# Set Demo Mode flag
export VITE_DEMO_MODE="true"
export VITE_API_URL="http://localhost:5000/api" # Fallback, ignored by mocks

echo "Starting Frontend (Vite)..."
npm run dev -- --port 5173 
