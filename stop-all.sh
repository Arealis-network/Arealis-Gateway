#!/bin/bash

echo "🛑 Stopping Arealis Gateway - Complete Platform"
echo "==============================================="

# Stop frontend and backend processes
if [ -f ".pids" ]; then
    echo "🔄 Stopping application processes..."
    PIDS=$(cat .pids)
    for pid in $PIDS; do
        if kill -0 $pid 2>/dev/null; then
            echo "  Stopping process $pid..."
            kill $pid
        fi
    done
    rm .pids
    echo "✅ Application processes stopped"
else
    echo "⚠️  No PID file found, stopping processes manually..."
    
    # Kill processes by port
    echo "🔄 Stopping processes on ports 3000, 3001, 8000, 8002, 8003, 8004, 8005..."
    lsof -ti:3000,3001,8000,8002,8003,8004,8005 | xargs kill -9 2>/dev/null || true
    echo "✅ Processes stopped"
fi

# Stop Docker services
echo "🐳 Stopping Docker services..."
docker-compose down

echo ""
echo "✅ All services stopped successfully!"
echo "🎯 Arealis Gateway platform is now offline"
