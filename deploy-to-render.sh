#!/bin/bash

# Arealis Gateway Backend Deployment Script for Render
# This script provides instructions and commands for deploying services to Render

echo "🚀 Arealis Gateway Backend Deployment to Render"
echo "=============================================="

echo ""
echo "📋 Prerequisites:"
echo "1. Render account (https://render.com)"
echo "2. GitHub repository connected to Render"
echo "3. Database credentials configured"

echo ""
echo "🔧 Services to Deploy:"
echo "1. ACC Service (Anti-Corruption Compliance) - Port 10000"
echo "2. ARL Service (Account Reconciliation Ledger) - Port 10001"
echo "3. CRRAK Service (Compliance & Regulatory Reporting) - Port 10002"
echo "4. PDR Service (Payment Data Repository) - Port 10003"
echo "5. RCA Service (Root Cause Analysis) - Port 10004"

echo ""
echo "📝 Deployment Steps:"
echo "1. Go to Render Dashboard (https://dashboard.render.com)"
echo "2. Click 'New +' → 'Web Service'"
echo "3. Connect your GitHub repository"
echo "4. For each service, use the configuration from DEPLOYMENT_GUIDE.md"

echo ""
echo "🔗 Service URLs (after deployment):"
echo "- ACC: https://arealis-acc-service.onrender.com"
echo "- ARL: https://arealis-arl-service.onrender.com"
echo "- CRRAK: https://arealis-crrak-service.onrender.com"
echo "- PDR: https://arealis-pdr-service.onrender.com"
echo "- RCA: https://arealis-rca-service.onrender.com"

echo ""
echo "📚 API Documentation:"
echo "Each service provides docs at: {service-url}/docs"

echo ""
echo "✅ Health Check Endpoints:"
echo "Each service has health checks at: {service-url}/health"

echo ""
echo "🔍 Troubleshooting:"
echo "- Check Render service logs for errors"
echo "- Verify environment variables are set correctly"
echo "- Ensure database connections are working"
echo "- Monitor service health through Render dashboard"

echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 Happy Deploying!"
