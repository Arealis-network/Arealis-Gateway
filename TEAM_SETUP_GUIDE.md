# 🚀 Arealis Gateway - Team Setup & Run Guide

## 📋 Prerequisites

### Required Software:
- **Node.js** (v18 or higher)
- **Python** (v3.11 or higher)
- **Docker** & **Docker Compose**
- **Git**

### Installation Commands:
```bash
# macOS (using Homebrew)
brew install node python docker docker-compose git

# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm python3 python3-pip docker.io docker-compose git

# Windows
# Download and install from official websites:
# - Node.js: https://nodejs.org/
# - Python: https://python.org/
# - Docker Desktop: https://docker.com/products/docker-desktop
# - Git: https://git-scm.com/
```

## 🏗️ Project Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Arealis-network/Arealis-Gateway.git
cd Arealis-Gateway
```

### 2. Install Frontend Dependencies
```bash
# Install root dependencies (monorepo management)
npm install

# Install frontend dependencies
cd frontend
npm install

# Install client portal dependencies
cd ../client_portal
npm install
```

### 3. Install Backend Dependencies
```bash
# Install Python dependencies for all services
cd ../services
pip install -r requirements.txt

# Install individual service dependencies
cd acc && pip install -r requirements.txt && cd ..
cd pdr && pip install -r requirements.txt && cd ..
cd arl && pip install -r requirements.txt && cd ..
cd rca && pip install -r requirements.txt && cd ..
cd crrak && pip install -r requirements.txt && cd ..
```

## 🚀 Running the Complete Project

### Option 1: Quick Start (All Services)
```bash
# Start infrastructure services (Redis, Kafka, Zookeeper)
docker-compose up -d redis kafka zookeeper

# Start all backend services (in separate terminals)
cd services/acc && python start_service.py &
cd services/pdr && python -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload &
cd services/arl && python -m uvicorn main:app --host 0.0.0.0 --port 8003 --reload &
cd services/rca && python -m uvicorn main_simple:app --host 0.0.0.0 --port 8004 --reload &
cd services/crrak && python -m uvicorn main_simple:app --host 0.0.0.0 --port 8005 --reload &

# Start frontend applications
cd frontend && PORT=3000 npm run dev &
cd client_portal && PORT=3001 npm run dev &
```

### Option 2: Step-by-Step Setup

#### Step 1: Start Infrastructure
```bash
docker-compose up -d redis kafka zookeeper
```

#### Step 2: Start Backend Services (5 terminals)
```bash
# Terminal 1 - ACC Service
cd services/acc
python start_service.py

# Terminal 2 - PDR Service  
cd services/pdr
python -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload

# Terminal 3 - ARL Service
cd services/arl
python -m uvicorn main:app --host 0.0.0.0 --port 8003 --reload

# Terminal 4 - RCA Service
cd services/rca
python -m uvicorn main_simple:app --host 0.0.0.0 --port 8004 --reload

# Terminal 5 - CRRAK Service
cd services/crrak
python -m uvicorn main_simple:app --host 0.0.0.0 --port 8005 --reload
```

#### Step 3: Start Frontend Applications (2 terminals)
```bash
# Terminal 6 - Main Frontend
cd frontend
PORT=3000 npm run dev

# Terminal 7 - Client Portal
cd client_portal
PORT=3001 npm run dev
```

## 🌐 Access Points

### Frontend Applications:
- **Main Website**: http://localhost:3000
- **Client Portal**: http://localhost:3001

### Backend Services:
- **ACC Service**: http://localhost:8000
- **PDR Service**: http://localhost:8002
- **ARL Service**: http://localhost:8003
- **RCA Service**: http://localhost:8004
- **CRRAK Service**: http://localhost:8005

### API Documentation:
- **ACC API Docs**: http://localhost:8000/docs
- **PDR API Docs**: http://localhost:8002/docs
- **ARL API Docs**: http://localhost:8003/docs
- **RCA API Docs**: http://localhost:8004/docs
- **CRRAK API Docs**: http://localhost:8005/docs

## 🔧 Service Details

### Backend Services:
1. **ACC (Anti-Corruption Compliance)** - Port 8000
   - Handles compliance checks and policy enforcement
   - Connected to PostgreSQL and Neo4j databases
   - Processes vendor payments, payroll, and loan disbursements

2. **PDR (Payment Data Reconciliation)** - Port 8002
   - Manages payment routing and reconciliation
   - Provides live queue monitoring and rail health checks

3. **ARL (Account Reconciliation Logic)** - Port 8003
   - Handles account reconciliation and ledger management
   - Provides overview metrics and reconciliation data

4. **RCA (Root Cause Analysis)** - Port 8004
   - Manages investigations and root cause analysis
   - Provides explainability features and investigation tracking

5. **CRRAK (Credit Risk Assessment)** - Port 8005
   - Handles credit risk assessment and audit filings
   - Manages regulatory compliance and reporting

### Infrastructure:
- **Redis**: Port 6379 (Caching and session management)
- **Kafka**: Port 9092 (Message queuing)
- **Zookeeper**: Port 2181 (Kafka coordination)

## 🛠️ Development Commands

### Frontend Development:
```bash
# Main frontend
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linting

# Client portal
cd client_portal
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linting
```

### Backend Development:
```bash
# Individual service development
cd services/[service_name]
python -m uvicorn main:app --host 0.0.0.0 --port [port] --reload

# Service-specific commands
cd services/acc
python start_service.py    # ACC service with database setup
```

## 🐛 Troubleshooting

### Common Issues:

#### Port Already in Use:
```bash
# Kill processes on specific ports
lsof -ti:3000,3001,8000,8002,8003,8004,8005 | xargs kill -9

# Or restart Docker services
docker-compose down
docker-compose up -d redis kafka zookeeper
```

#### Python Dependencies:
```bash
# Reinstall Python dependencies
cd services
pip install -r requirements.txt --force-reinstall
```

#### Node Dependencies:
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Database Connection Issues:
- Check if PostgreSQL and Neo4j credentials are correct
- Verify network connectivity to external databases
- Check service logs for specific error messages

## 📊 Health Checks

### Verify All Services:
```bash
# Test all endpoints
curl http://localhost:3000  # Frontend
curl http://localhost:3001  # Client Portal
curl http://localhost:8000  # ACC Service
curl http://localhost:8002  # PDR Service
curl http://localhost:8003  # ARL Service
curl http://localhost:8004  # RCA Service
curl http://localhost:8005  # CRRAK Service
```

### Expected Responses:
- Frontend/Client Portal: HTML content
- Backend Services: JSON with service status

## 🚀 Production Deployment

### Docker Deployment:
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Individual Service Deployment:
```bash
# Each service has its own Dockerfile
cd services/[service_name]
docker build -t [service_name] .
docker run -p [port]:8000 [service_name]
```

## 📝 Environment Variables

### Required Environment Variables:
```bash
# Database connections (already configured)
DATABASE_URL=postgresql://postgres:password@host:port/database
NEO4J_URI=neo4j+s://your-neo4j-instance
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password

# API Keys
NEXT_PUBLIC_API_KEY=arealis_api_key_2024
```

## 🎯 Quick Start Script

Create a `start-all.sh` script:
```bash
#!/bin/bash
echo "🚀 Starting Arealis Gateway..."

# Start infrastructure
docker-compose up -d redis kafka zookeeper
sleep 5

# Start backend services
cd services/acc && python start_service.py &
cd services/pdr && python -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload &
cd services/arl && python -m uvicorn main:app --host 0.0.0.0 --port 8003 --reload &
cd services/rca && python -m uvicorn main_simple:app --host 0.0.0.0 --port 8004 --reload &
cd services/crrak && python -m uvicorn main_simple:app --host 0.0.0.0 --port 8005 --reload &

# Start frontend
cd frontend && PORT=3000 npm run dev &
cd client_portal && PORT=3001 npm run dev &

echo "✅ All services started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🌐 Client Portal: http://localhost:3001"
echo "📚 API Docs: http://localhost:8000/docs"
```

## 📞 Support

### Team Contacts:
- **Technical Issues**: [Your technical lead]
- **Database Issues**: [Your database admin]
- **Deployment Issues**: [Your DevOps team]

### Documentation:
- **API Documentation**: Available at each service's `/docs` endpoint
- **Service READMEs**: Located in each service directory
- **Deployment Guides**: Available in project root

---

## 🎉 You're Ready!

Once all services are running, you'll have a fully functional Arealis Gateway platform with:
- ✅ Complete payment processing workflow
- ✅ Compliance and audit features
- ✅ Real-time monitoring and analytics
- ✅ Investigation and root cause analysis
- ✅ Multi-tenant client portal

**Happy coding! 🚀**
