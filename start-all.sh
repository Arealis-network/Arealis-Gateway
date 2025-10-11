#!/bin/bash

echo "🚀 Starting Arealis Gateway - Complete Platform"
echo "================================================"

# Check if required tools are installed
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python3 is required but not installed. Aborting." >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites check passed"

# Start infrastructure services
echo "🐳 Starting infrastructure services (Redis, Kafka, Zookeeper)..."
docker-compose up -d redis kafka zookeeper
sleep 5

# Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

if [ ! -d "client_portal/node_modules" ]; then
    echo "Installing client portal dependencies..."
    cd client_portal && npm install && cd ..
fi

if [ ! -d "services/acc/__pycache__" ]; then
    echo "Installing Python dependencies..."
    cd services && pip install -r requirements.txt && cd ..
fi

# Start backend services in background
echo "🔧 Starting backend services..."

# ACC Service
echo "  Starting ACC Service (Port 8000)..."
cd services/acc && python start_service.py > ../../logs/acc.log 2>&1 &
ACC_PID=$!
cd ../..

# PDR Service
echo "  Starting PDR Service (Port 8002)..."
cd services/pdr && python -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload > ../../logs/pdr.log 2>&1 &
PDR_PID=$!
cd ../..

# ARL Service
echo "  Starting ARL Service (Port 8003)..."
cd services/arl && python -m uvicorn main:app --host 0.0.0.0 --port 8003 --reload > ../../logs/arl.log 2>&1 &
ARL_PID=$!
cd ../..

# RCA Service
echo "  Starting RCA Service (Port 8004)..."
cd services/rca && python -m uvicorn main_simple:app --host 0.0.0.0 --port 8004 --reload > ../../logs/rca.log 2>&1 &
RCA_PID=$!
cd ../..

# CRRAK Service
echo "  Starting CRRAK Service (Port 8005)..."
cd services/crrak && python -m uvicorn main_simple:app --host 0.0.0.0 --port 8005 --reload > ../../logs/crrak.log 2>&1 &
CRRAK_PID=$!
cd ../..

# Create logs directory
mkdir -p logs

# Wait for backend services to start
echo "⏳ Waiting for backend services to initialize..."
sleep 10

# Start frontend applications
echo "🌐 Starting frontend applications..."

# Main Frontend
echo "  Starting Main Frontend (Port 3000)..."
cd frontend && PORT=3000 npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Client Portal
echo "  Starting Client Portal (Port 3001)..."
cd client_portal && PORT=3001 npm run dev > ../logs/client_portal.log 2>&1 &
CLIENT_PID=$!
cd ..

# Wait for frontend to start
sleep 5

echo ""
echo "🎉 Arealis Gateway is now running!"
echo "=================================="
echo ""
echo "🌐 Frontend Applications:"
echo "  • Main Website:     http://localhost:3000"
echo "  • Client Portal:    http://localhost:3001"
echo ""
echo "🔧 Backend Services:"
echo "  • ACC Service:      http://localhost:8000"
echo "  • PDR Service:      http://localhost:8002"
echo "  • ARL Service:      http://localhost:8003"
echo "  • RCA Service:      http://localhost:8004"
echo "  • CRRAK Service:    http://localhost:8005"
echo ""
echo "📚 API Documentation:"
echo "  • ACC API Docs:     http://localhost:8000/docs"
echo "  • PDR API Docs:     http://localhost:8002/docs"
echo "  • ARL API Docs:     http://localhost:8003/docs"
echo "  • RCA API Docs:     http://localhost:8004/docs"
echo "  • CRRAK API Docs:   http://localhost:8005/docs"
echo ""
echo "📊 Infrastructure:"
echo "  • Redis:            Port 6379"
echo "  • Kafka:            Port 9092"
echo "  • Zookeeper:        Port 2181"
echo ""
echo "📝 Logs are available in the 'logs/' directory"
echo ""
echo "🛑 To stop all services, run: ./stop-all.sh"
echo ""

# Save PIDs for stop script
echo "$ACC_PID $PDR_PID $ARL_PID $RCA_PID $CRRAK_PID $FRONTEND_PID $CLIENT_PID" > .pids

echo "✅ All services started successfully!"
echo "🚀 Ready for development!"
