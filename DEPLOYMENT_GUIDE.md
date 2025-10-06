# Arealis Gateway Backend Deployment Guide

This guide covers deploying the Arealis Gateway backend services to Render.

## Services Overview

The backend consists of 5 microservices:

1. **ACC Service** (Anti-Corruption Compliance) - Port 10000
2. **ARL Service** (Account Reconciliation Ledger) - Port 10001  
3. **CRRAK Service** (Compliance & Regulatory Reporting) - Port 10002
4. **PDR Service** (Payment Data Repository) - Port 10003
5. **RCA Service** (Root Cause Analysis) - Port 10004

## Prerequisites

- Render account
- GitHub repository access
- Database credentials (PostgreSQL and Neo4j)

## Deployment Steps

### 1. ACC Service Deployment

1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `arealis-acc-service`
   - **Root Directory**: `services/acc`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main:app --host 0.0.0.0 --port $PORT`

5. Environment Variables:
   ```
   DATABASE_URL=postgresql://postgres:NmxNfLIKzWQzxwrmQUiKCouDXhcScjcD@switchyard.proxy.rlwy.net:25675/railway
   NEO4J_URI=neo4j+s://6933b562.databases.neo4j.io
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=Yavi0NJTNDApnMb-InD3pCVwdgT7Hzd2-6vb-tYshZo
   NEO4J_DATABASE=neo4j
   PORT=10000
   ```

### 2. ARL Service Deployment

1. Create new Web Service
2. Configure:
   - **Name**: `arealis-arl-service`
   - **Root Directory**: `services/arl`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main_complete:app --host 0.0.0.0 --port $PORT`

3. Environment Variables:
   ```
   PORT=10001
   ```

### 3. CRRAK Service Deployment

1. Create new Web Service
2. Configure:
   - **Name**: `arealis-crrak-service`
   - **Root Directory**: `services/crrak`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main_simple:app --host 0.0.0.0 --port $PORT`

3. Environment Variables:
   ```
   PORT=10002
   ```

### 4. PDR Service Deployment

1. Create new Web Service
2. Configure:
   - **Name**: `arealis-pdr-service`
   - **Root Directory**: `services/pdr`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main:app --host 0.0.0.0 --port $PORT`

3. Environment Variables:
   ```
   PORT=10003
   ```

### 5. RCA Service Deployment

1. Create new Web Service
2. Configure:
   - **Name**: `arealis-rca-service`
   - **Root Directory**: `services/rca`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main_simple:app --host 0.0.0.0 --port $PORT`

3. Environment Variables:
   ```
   PORT=10004
   ```

## Service URLs

After deployment, your services will be available at:

- ACC Service: `https://arealis-acc-service.onrender.com`
- ARL Service: `https://arealis-arl-service.onrender.com`
- CRRAK Service: `https://arealis-crrak-service.onrender.com`
- PDR Service: `https://arealis-pdr-service.onrender.com`
- RCA Service: `https://arealis-rca-service.onrender.com`

## API Documentation

Each service provides automatic API documentation at:
- `{service-url}/docs` - Swagger UI
- `{service-url}/redoc` - ReDoc

## Health Checks

All services include health check endpoints:
- `{service-url}/health` - Service health status
- `{service-url}/` - Basic service info

## Troubleshooting

### Common Issues

1. **Build Failures**: Check requirements.txt and Python version compatibility
2. **Database Connection**: Verify environment variables and database accessibility
3. **CORS Issues**: Services are configured to allow all origins in production
4. **Port Issues**: Ensure PORT environment variable is set correctly

### Logs

Check Render service logs for debugging:
1. Go to your service dashboard
2. Click on "Logs" tab
3. Monitor real-time logs during deployment and runtime

## Security Notes

- API keys are configured for authentication
- Database credentials are stored as environment variables
- CORS is configured for production use
- Services use HTTPS in production

## Monitoring

- Monitor service health through Render dashboard
- Set up alerts for service downtime
- Monitor database connections and performance
- Track API usage and response times
