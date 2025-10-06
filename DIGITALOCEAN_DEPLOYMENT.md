# DigitalOcean App Platform Deployment

## 🚀 Deploy to DigitalOcean App Platform

### Step 1: Setup DigitalOcean
1. Go to **https://cloud.digitalocean.com**
2. Sign up for account
3. Go to **Apps** section

### Step 2: Create App
1. Click **"Create App"**
2. Connect GitHub repository: `Arealis-Gateway`
3. Select **"services/acc"** as source directory

### Step 3: Configure Service
- **Name**: `arealis-acc-service`
- **Source Directory**: `services/acc`
- **Build Command**: `pip install -r requirements.txt`
- **Run Command**: `python start.py`

### Step 4: Environment Variables
Add in App Spec:
```yaml
envs:
- key: DATABASE_URL
  value: postgresql://postgres:NmxNfLIKzWQzxwrmQUiKCouDXhcScjcD@switchyard.proxy.rlwy.net:25675/railway
- key: NEO4J_URI
  value: neo4j+s://6933b562.databases.neo4j.io
- key: NEO4J_USERNAME
  value: neo4j
- key: NEO4J_PASSWORD
  value: Yavi0NJTNDApnMb-InD3pCVwdgT7Hzd2-6vb-tYshZo
- key: NEO4J_DATABASE
  value: neo4j
```

## 🎯 Benefits of DigitalOcean
- ✅ Reliable infrastructure
- ✅ Good Python support
- ✅ Competitive pricing
- ✅ Easy scaling
