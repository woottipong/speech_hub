#!/bin/bash

# Speech Hub Development Server Starter
# Starts both backend and frontend development servers

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo "🚀 Starting Speech Hub Development Servers..."
echo "📁 Backend: $BACKEND_DIR"
echo "📁 Frontend: $FRONTEND_DIR"

# Check if backend dependencies are installed
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd "$BACKEND_DIR" && npm install
fi

# Check if frontend dependencies are installed  
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd "$FRONTEND_DIR" && npm install
fi

# Start backend server in background
echo "🔧 Starting backend server..."
(cd "$BACKEND_DIR" && npm run dev) &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend server in background
echo "🎨 Starting frontend server..."
(cd "$FRONTEND_DIR" && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "✅ Speech Hub is running!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:3001"
echo "🎙️  WebSocket: ws://localhost:3001/api/stt/realtime"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All servers stopped"
    exit 0
}

# Trap Ctrl+C to cleanup
trap cleanup INT

# Wait for both processes
wait
