# 🚀 Complete Render Deployment Guide for Team

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Render Account Setup](#render-account-setup)
3. [Understanding Render](#understanding-render)
4. [Deploying ACC Service (First Service)](#deploying-acc-service-first-service)
5. [Deploying Remaining Services](#deploying-remaining-services)
6. [Testing Your Deployments](#testing-your-deployments)
7. [Troubleshooting Common Issues](#troubleshooting-common-issues)
8. [Team Collaboration](#team-collaboration)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## 🎯 Prerequisites

### What You Need Before Starting:
- ✅ **GitHub Account** (for repository access)
- ✅ **Render Account** (we'll create this)
- ✅ **Access to Magnus-Ai Repository** (`swaroop-thakare/Magnus-Ai`)
- ✅ **Basic understanding of web services** (helpful but not required)

### Time Required:
- **First deployment**: 15-20 minutes
- **Each additional service**: 5-10 minutes
- **Total for all 5 services**: 45-60 minutes

---

## 🔧 Render Account Setup

### Step 1: Create Render Account
1. **Go to**: https://render.com
2. **Click "Get Started for Free"**
3. **Sign up with GitHub** (recommended)
   - Click "Continue with GitHub"
   - Authorize Render to access your GitHub account
4. **Complete your profile** (optional but recommended)

### Step 2: Verify Account
1. **Check your email** for verification link
2. **Click the verification link**
3. **Return to Render dashboard**

### Step 3: Understanding Render Dashboard
- **Dashboard**: Overview of all your services
- **Services**: Individual web services, databases, etc.
- **Projects**: Group related services together
- **Settings**: Account and billing settings

---

## 📚 Understanding Render

### What is Render?
Render is a cloud platform that automatically deploys your code from GitHub repositories. Think of it as a service that:
- Takes your code from GitHub
- Builds it (installs dependencies)
- Runs it on the internet
- Gives you a public URL

### Key Concepts:
- **Web Service**: Your application running on the internet
- **Build Command**: Instructions to prepare your code
- **Start Command**: Instructions to run your application
- **Environment Variables**: Secret settings (like database passwords)
- **Root Directory**: Which folder in your repository to use

### Render vs Other Platforms:
- **Easier than AWS**: No complex configuration
- **Similar to Heroku**: But with better free tier
- **Automatic deployments**: Updates when you push to GitHub

---

## 🚀 Deploying ACC Service (First Service)

### Why Start with ACC?
- Most complex service (has database connections)
- If this works, others will work too
- Sets up the foundation for other services

### Step 1: Create New Web Service
1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** (top right corner)
3. **Select "Web Service"**

### Step 2: Connect Repository
1. **Click "Connect GitHub"**
2. **Find and select**: `swaroop-thakare/Magnus-Ai`
3. **Click "Connect"**
4. **Wait for repository to load**

### Step 3: Configure Basic Settings
Fill out the form with these **exact values**:

#### Basic Information:
- **Name**: `arealis-acc-service`
  - This will be your service URL: `https://arealis-acc-service.onrender.com`
- **Environment**: `Python 3`
- **Region**: `Oregon (US West)` (or closest to your users)
- **Branch**: `main`

#### Build & Deploy Settings:
- **Root Directory**: `services/acc`
  - This tells Render to look in the `services/acc` folder
- **Build Command**: `bash build.sh`
  - This runs our custom build script
- **Start Command**: `python simple_start.py`
  - This starts our application

#### Instance Settings:
- **Instance Type**: `Free`
  - Good for testing and development

### Step 4: Add Environment Variables
Environment variables are like secret settings that your app needs to work.

1. **Click "Advanced"** at the bottom of the form
2. **Click "Environment Variables"**
3. **Add these variables one by one** (click "Add Environment Variable" for each):

```
Name: DATABASE_URL
Value: postgresql://postgres:NmxNfLIKzWQzxwrmQUiKCouDXhcScjcD@switchyard.proxy.rlwy.net:25675/railway
```

```
Name: NEO4J_URI
Value: neo4j+s://6933b562.databases.neo4j.io
```

```
Name: NEO4J_USERNAME
Value: neo4j
```

```
Name: NEO4J_PASSWORD
Value: Yavi0NJTNDApnMb-InD3pCVwdgT7Hzd2-6vb-tYshZo
```

```
Name: NEO4J_DATABASE
Value: neo4j
```

```
Name: PORT
Value: 10000
```

### Step 5: Deploy Your Service
1. **Review all settings** to make sure they're correct
2. **Click "Create Web Service"** at the bottom
3. **Wait for deployment** (this takes 2-5 minutes)

### Step 6: Monitor Deployment
1. **Watch the build logs** in real-time
2. **Look for these success messages**:
   ```
   ✅ Building ACC service for Render...
   ✅ SQLAlchemy installed successfully
   ✅ FastAPI installed successfully
   ✅ Build completed successfully!
   ✅ Starting ACC Agent Service...
   ✅ Binding to host 0.0.0.0 on port 10000
   ✅ Service is live!
   ```

### Step 7: Test Your Service
Once deployment is complete:

1. **Go to your service URL**: `https://arealis-acc-service.onrender.com`
2. **Test health endpoint**: `https://arealis-acc-service.onrender.com/health`
3. **View API documentation**: `https://arealis-acc-service.onrender.com/docs`

---

## 🔄 Deploying Remaining Services

Once ACC service is working, deploy the other 4 services using the same process:

### ARL Service
- **Name**: `arealis-arl-service`
- **Root Directory**: `services/arl`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python main_complete.py`
- **Environment Variables**: Only `PORT = 10001`

### CRRAK Service
- **Name**: `arealis-crrak-service`
- **Root Directory**: `services/crrak`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python main_simple.py`
- **Environment Variables**: Only `PORT = 10002`

### PDR Service
- **Name**: `arealis-pdr-service`
- **Root Directory**: `services/pdr`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python main.py`
- **Environment Variables**: Only `PORT = 10003`

### RCA Service
- **Name**: `arealis-rca-service`
- **Root Directory**: `services/rca`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python main_simple.py`
- **Environment Variables**: Only `PORT = 10004`

---

## 🧪 Testing Your Deployments

### Health Check URLs
Test each service to make sure it's working:

- **ACC**: `https://arealis-acc-service.onrender.com/health`
- **ARL**: `https://arealis-arl-service.onrender.com/health`
- **CRRAK**: `https://arealis-crrak-service.onrender.com/health`
- **PDR**: `https://arealis-pdr-service.onrender.com/health`
- **RCA**: `https://arealis-rca-service.onrender.com/health`

### Expected Response
Each health check should return:
```json
{
  "status": "healthy",
  "service": "service-name"
}
```

### API Documentation URLs
View the interactive API documentation:

- **ACC**: `https://arealis-acc-service.onrender.com/docs`
- **ARL**: `https://arealis-arl-service.onrender.com/docs`
- **CRRAK**: `https://arealis-crrak-service.onrender.com/docs`
- **PDR**: `https://arealis-pdr-service.onrender.com/docs`
- **RCA**: `https://arealis-rca-service.onrender.com/docs`

---

## 🚨 Troubleshooting Common Issues

### Issue 1: Build Fails
**Symptoms**: Build process stops with errors
**Solutions**:
1. Check build logs for specific error messages
2. Try changing build command to: `pip install -r requirements.txt`
3. Make sure Root Directory is correct: `services/acc`

### Issue 2: Service Won't Start
**Symptoms**: Build succeeds but service crashes
**Solutions**:
1. Check start command is correct: `python simple_start.py`
2. Verify all environment variables are set
3. Try alternative start command: `gunicorn main:app --host 0.0.0.0 --port $PORT`

### Issue 3: Database Connection Errors
**Symptoms**: Service starts but can't connect to database
**Solutions**:
1. Double-check environment variables (especially DATABASE_URL)
2. Make sure database credentials are correct
3. Check if database service is running

### Issue 4: Port Binding Errors
**Symptoms**: "Port binding" error messages
**Solutions**:
1. Ensure PORT environment variable is set to 10000
2. Make sure start command uses `0.0.0.0` as host
3. Try the gunicorn start command

### Issue 5: Module Not Found Errors
**Symptoms**: "ModuleNotFoundError" in logs
**Solutions**:
1. Check if build command installed all dependencies
2. Try using the enhanced build script: `bash build.sh`
3. Verify requirements.txt file exists

### Getting Help
1. **Check Render logs**: Go to your service → "Logs" tab
2. **Check GitHub repository**: Make sure code is up to date
3. **Ask team members**: Someone else might have solved the same issue
4. **Render documentation**: https://render.com/docs

---

## 👥 Team Collaboration

### Sharing Access
1. **Go to your service settings**
2. **Click "Collaborators"**
3. **Add team members by email**
4. **Set appropriate permissions**

### Deployment Workflow
1. **One person deploys first** (usually the most experienced)
2. **Share the configuration** with the team
3. **Others can follow the same steps**
4. **Document any issues** and solutions

### Code Updates
1. **Push changes to GitHub**
2. **Render automatically redeploys** (if auto-deploy is enabled)
3. **Monitor deployment** in Render dashboard
4. **Test the updated service**

---

## 📊 Monitoring and Maintenance

### Daily Checks
- [ ] All services are running (green status)
- [ ] Health checks are responding
- [ ] No error messages in logs

### Weekly Checks
- [ ] Review service performance
- [ ] Check for any failed deployments
- [ ] Update dependencies if needed

### Monthly Checks
- [ ] Review Render usage and costs
- [ ] Update service configurations
- [ ] Backup important data

### Service URLs Summary
After successful deployment, you'll have these URLs:

| Service | URL | Health Check | API Docs |
|---------|-----|--------------|----------|
| ACC | `https://arealis-acc-service.onrender.com` | `/health` | `/docs` |
| ARL | `https://arealis-arl-service.onrender.com` | `/health` | `/docs` |
| CRRAK | `https://arealis-crrak-service.onrender.com` | `/health` | `/docs` |
| PDR | `https://arealis-pdr-service.onrender.com` | `/health` | `/docs` |
| RCA | `https://arealis-rca-service.onrender.com` | `/health` | `/docs` |

---

## 🎉 Success Checklist

When everything is working, you should have:

- [ ] ✅ All 5 services deployed successfully
- [ ] ✅ All health checks responding
- [ ] ✅ All API documentation accessible
- [ ] ✅ Database connections working (ACC service)
- [ ] ✅ No critical errors in logs
- [ ] ✅ Services responding within 2-3 seconds
- [ ] ✅ Team members have access to services

---

## 📞 Getting Help

### If You Get Stuck:
1. **Check this guide** first
2. **Look at Render logs** for error messages
3. **Ask team members** who have already deployed
4. **Check Render documentation**: https://render.com/docs
5. **Contact the project lead** for complex issues

### Useful Links:
- **Render Dashboard**: https://dashboard.render.com
- **Render Documentation**: https://render.com/docs
- **GitHub Repository**: https://github.com/swaroop-thakare/Magnus-Ai
- **FastAPI Documentation**: https://fastapi.tiangolo.com

---

## 🚀 Ready to Deploy?

Follow this guide step by step, and you'll have all your backend services running on Render in no time! Remember:

1. **Start with ACC service** (most complex)
2. **Follow the exact configuration** provided
3. **Test each service** after deployment
4. **Ask for help** if you get stuck
5. **Share your success** with the team!

Good luck with your deployment! 🎉
