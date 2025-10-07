# 🚨 Render Deployment Troubleshooting Guide

## 🔍 How to Debug Issues

### Step 1: Check Build Logs
1. Go to your service in Render dashboard
2. Click "Logs" tab
3. Look for error messages in red
4. Copy the error message for reference

### Step 2: Check Service Logs
1. After build completes, check runtime logs
2. Look for startup errors
3. Check if service is binding to correct port

### Step 3: Verify Configuration
1. Double-check all settings match the guide
2. Verify environment variables are set
3. Ensure repository and branch are correct

---

## 🚨 Common Error Messages & Solutions

### 1. "ModuleNotFoundError: No module named 'sqlalchemy'"

**What it means**: Dependencies weren't installed properly during build

**Solutions**:
1. **Change build command** to: `pip install -r requirements.txt`
2. **For ACC service**, use: `bash build.sh`
3. **Check requirements.txt** exists in the root directory

**Alternative build commands to try**:
```
pip install -r requirements.txt --verbose
pip install --upgrade pip && pip install -r requirements.txt
```

### 2. "Port binding" or "Address already in use"

**What it means**: Service isn't binding to the correct port

**Solutions**:
1. **Ensure PORT environment variable** is set to `10000`
2. **Check start command** uses `0.0.0.0` as host
3. **Try alternative start commands**:
   ```
   gunicorn main:app --host 0.0.0.0 --port $PORT
   python gunicorn_start.py
   ```

### 3. "Build failed" or "Exited with status 1"

**What it means**: Build process encountered an error

**Solutions**:
1. **Check build logs** for specific error
2. **Try different build commands**:
   ```
   pip install -r requirements.txt
   bash build.sh
   pip install --upgrade pip && pip install -r requirements.txt
   ```
3. **Verify Python version** (should be 3.10.12)

### 4. "Service failed to start" or "Crashed"

**What it means**: Service started but then stopped

**Solutions**:
1. **Check runtime logs** for error messages
2. **Try different start commands**:
   ```
   python simple_start.py
   python start.py
   gunicorn main:app --host 0.0.0.0 --port $PORT
   ```
3. **Verify all environment variables** are set correctly

### 5. "Database connection failed"

**What it means**: Can't connect to PostgreSQL or Neo4j

**Solutions**:
1. **Check environment variables** (especially DATABASE_URL)
2. **Verify database credentials** are correct
3. **Test database connection** from your local machine
4. **Check if database service** is running

### 6. "Repository not found" or "Access denied"

**What it means**: Render can't access your GitHub repository

**Solutions**:
1. **Reconnect repository** in Render settings
2. **Check repository permissions** on GitHub
3. **Make sure repository is public** or Render has access
4. **Verify repository name** is correct

### 7. "Root directory not found"

**What it means**: The specified root directory doesn't exist

**Solutions**:
1. **Check root directory** is correct: `services/acc`
2. **Verify directory exists** in your repository
3. **Check branch** is set to `main`
4. **Make sure code is pushed** to GitHub

---

## 🔧 Alternative Configurations

### If Standard Configuration Fails

#### Alternative 1: Simple Build
```
Build Command: pip install -r requirements.txt
Start Command: python main.py
```

#### Alternative 2: Gunicorn
```
Build Command: pip install -r requirements.txt
Start Command: gunicorn main:app --host 0.0.0.0 --port $PORT
```

#### Alternative 3: Direct Python
```
Build Command: pip install -r requirements.txt
Start Command: python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

### For ACC Service Specifically

#### If build.sh fails:
```
Build Command: pip install -r requirements.txt
Start Command: python simple_start.py
```

#### If simple_start.py fails:
```
Build Command: pip install -r requirements.txt
Start Command: python gunicorn_start.py
```

#### If all Python commands fail:
```
Build Command: pip install -r requirements.txt
Start Command: gunicorn main:app --host 0.0.0.0 --port $PORT
```

---

## 📊 Debugging Checklist

### Before Asking for Help:
- [ ] ✅ Checked build logs for errors
- [ ] ✅ Checked runtime logs for errors
- [ ] ✅ Verified all environment variables are set
- [ ] ✅ Tried alternative build/start commands
- [ ] ✅ Confirmed repository and branch are correct
- [ ] ✅ Verified root directory exists
- [ ] ✅ Checked if code is up to date on GitHub

### Information to Provide When Asking for Help:
1. **Service name** you're trying to deploy
2. **Exact error message** from logs
3. **Build command** you're using
4. **Start command** you're using
5. **Environment variables** you've set
6. **Screenshot** of the error (if possible)

---

## 🆘 Emergency Solutions

### If Nothing Works:

#### Option 1: Start Fresh
1. Delete the service in Render
2. Create a new service with different name
3. Follow the guide again step by step

#### Option 2: Use Different Repository
1. Try deploying from `Arealis-Gateway` repository instead
2. Use same configuration but different repository

#### Option 3: Contact Team Lead
1. Share the exact error message
2. Provide screenshots of configuration
3. Ask for help with specific service

---

## 📞 Getting Help

### Internal Team Support:
1. **Ask team members** who have successfully deployed
2. **Share error messages** in team chat
3. **Document solutions** for future reference

### External Resources:
1. **Render Documentation**: https://render.com/docs
2. **Render Community**: https://community.render.com
3. **FastAPI Documentation**: https://fastapi.tiangolo.com

### When to Escalate:
- Multiple team members facing same issue
- Service was working but suddenly stopped
- Database connection issues persist
- Build fails consistently across different configurations

---

## 🎯 Success Indicators

### You Know It's Working When:
- ✅ Build logs show "Build completed successfully!"
- ✅ Service logs show "Starting server on port 10000"
- ✅ Health check returns `{"status": "healthy"}`
- ✅ API docs accessible at `/docs`
- ✅ No error messages in logs
- ✅ Service responds within 2-3 seconds

### Test Commands:
```bash
# Test health endpoint
curl https://your-service-name.onrender.com/health

# Test API docs
open https://your-service-name.onrender.com/docs
```

---

## 📝 Common Solutions Summary

| Problem | Quick Fix |
|---------|-----------|
| Module not found | Change build command to `pip install -r requirements.txt` |
| Port binding error | Ensure `PORT = 10000` environment variable |
| Service crashes | Try `gunicorn main:app --host 0.0.0.0 --port $PORT` |
| Build fails | Use `bash build.sh` for ACC, `pip install -r requirements.txt` for others |
| Database error | Check all 6 environment variables are set correctly |
| Repository access | Reconnect repository in Render settings |

Remember: Most issues can be solved by trying different build/start commands or checking environment variables! 🚀
