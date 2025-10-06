# Heroku Deployment Guide

## 🚀 Deploy to Heroku

### Step 1: Setup Heroku
1. Go to **https://heroku.com**
2. Sign up for free account
3. Install Heroku CLI: `npm install -g heroku`

### Step 2: Create Heroku Apps
```bash
# Create apps for each service
heroku create arealis-acc-service
heroku create arealis-arl-service
heroku create arealis-crrak-service
heroku create arealis-pdr-service
heroku create arealis-rca-service
```

### Step 3: Deploy ACC Service
```bash
cd services/acc
git init
heroku git:remote -a arealis-acc-service
git add .
git commit -m "Deploy ACC service"
git push heroku main
```

### Step 4: Set Environment Variables
```bash
heroku config:set DATABASE_URL="postgresql://postgres:NmxNfLIKzWQzxwrmQUiKCouDXhcScjcD@switchyard.proxy.rlwy.net:25675/railway" -a arealis-acc-service
heroku config:set NEO4J_URI="neo4j+s://6933b562.databases.neo4j.io" -a arealis-acc-service
heroku config:set NEO4J_USERNAME="neo4j" -a arealis-acc-service
heroku config:set NEO4J_PASSWORD="Yavi0NJTNDApnMb-InD3pCVwdgT7Hzd2-6vb-tYshZo" -a arealis-acc-service
heroku config:set NEO4J_DATABASE="neo4j" -a arealis-acc-service
```

### Step 5: Create Procfile
Create `services/acc/Procfile`:
```
web: python start.py
```

## 🎯 Benefits of Heroku
- ✅ Reliable Python support
- ✅ Easy CLI deployment
- ✅ Built-in scaling
- ✅ Add-ons marketplace
