# Railway Deployment Guide

## 🚀 Deploy to Railway (Recommended)

Railway is similar to Render but often more reliable for Python services.

### Step 1: Setup Railway
1. Go to **https://railway.app**
2. Sign up with GitHub
3. Connect your `Arealis-Gateway` repository

### Step 2: Deploy ACC Service
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose `Arealis-Gateway` repository
4. Select **"services/acc"** as root directory

### Step 3: Configure Service
- **Name**: `arealis-acc-service`
- **Root Directory**: `services/acc`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python start.py`

### Step 4: Environment Variables
Add these in Railway dashboard:
```
DATABASE_URL=postgresql://postgres:NmxNfLIKzWQzxwrmQUiKCouDXhcScjcD@switchyard.proxy.rlwy.net:25675/railway
NEO4J_URI=neo4j+s://6933b562.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=Yavi0NJTNDApnMb-InD3pCVwdgT7Hzd2-6vb-tYshZo
NEO4J_DATABASE=neo4j
PORT=10000
```

### Step 5: Deploy Other Services
Repeat for:
- ARL: `services/arl` → `arealis-arl-service`
- CRRAK: `services/crrak` → `arealis-crrak-service`
- PDR: `services/pdr` → `arealis-pdr-service`
- RCA: `services/rca` → `arealis-rca-service`

## 🎯 Benefits of Railway
- ✅ Better Python support
- ✅ Automatic deployments
- ✅ Built-in database support
- ✅ Free tier available
- ✅ Easy environment variable management
