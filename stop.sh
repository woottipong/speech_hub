#!/bin/bash

# Speech Hub Development Server Stopper
# Stops all running development servers

echo "🛑 Stopping Speech Hub Development Servers..."

# Find and kill backend processes (nodemon/server.js)
BACKEND_PIDS=$(ps aux | grep -E "(nodemon|server\.js)" | grep -v grep | awk '{print $2}')

if [ -n "$BACKEND_PIDS" ]; then
    echo "🔧 Stopping backend server(s)..."
    echo "$BACKEND_PIDS" | xargs kill 2>/dev/null
    echo "✅ Backend stopped"
else
    echo "ℹ️  No backend server found running"
fi

# Find and kill frontend processes (vite/dev server)
FRONTEND_PIDS=$(ps aux | grep -E "(vite|npm.*dev)" | grep -v grep | awk '{print $2}')

if [ -n "$FRONTEND_PIDS" ]; then
    echo "🎨 Stopping frontend server(s)..."
    echo "$FRONTEND_PIDS" | xargs kill 2>/dev/null
    echo "✅ Frontend stopped"
else
    echo "ℹ️  No frontend server found running"
fi

# Also kill any processes on ports 3001 and 5173
echo "🔍 Checking for processes on ports 3001 and 5173..."

# Kill processes on port 3001 (backend)
PORT_3001_PID=$(lsof -ti:3001 2>/dev/null)
if [ -n "$PORT_3001_PID" ]; then
    echo "🔧 Killing process on port 3001 (PID: $PORT_3001_PID)"
    kill $PORT_3001_PID 2>/dev/null
fi

# Kill processes on port 5173 (frontend)
PORT_5173_PID=$(lsof -ti:5173 2>/dev/null)
if [ -n "$PORT_5173_PID" ]; then
    echo "🎨 Killing process on port 5173 (PID: $PORT_5173_PID)"
    kill $PORT_5173_PID 2>/dev/null
fi

echo ""
echo "✅ All Speech Hub servers stopped"
echo "🎯 Ports 3001 and 5173 are now free"
