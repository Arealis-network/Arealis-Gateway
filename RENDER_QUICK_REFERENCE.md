# 🚀 Render Deployment - Quick Reference

## ⚡ Quick Setup (5 Minutes)

### 1. Create Web Service
- **Go to**: https://dashboard.render.com
- **Click**: "New +" → "Web Service"
- **Connect**: `swaroop-thakare/Magnus-Ai`

### 2. Configure Service
| Setting | Value |
|---------|-------|
| **Name** | `arealis-{service}-service` |
| **Root Directory** | `services/{service}` |
| **Build Command** | `bash build.sh` (ACC) or `pip install -r requirements.txt` |
| **Start Command** | `python simple_start.py` (ACC) or `python main.py` |

### 3. Environment Variables
```
PORT = 10000
DATABASE_URL = postgresql://postgres:NmxNfLIKzWQzxwrmQUiKCouDXhcScjcD@switchyard.proxy.rlwy.net:25675/railway
NEO4J_URI = neo4j+s://6933b562.databases.neo4j.io
NEO4J_USERNAME = neo4j
NEO4J_PASSWORD = Yavi0NJTNDApnMb-InD3pCVwdgT7Hzd2-6vb-tYshZo
NEO4J_DATABASE = neo4j
```

---

## 🎯 Service Configurations

### ACC Service (Complex - Database)
- **Name**: `arealis-acc-service`
- **Root**: `services/acc`
- **Build**: `bash build.sh`
- **Start**: `python simple_start.py`
- **Env Vars**: All 6 variables above

### ARL Service (Simple)
- **Name**: `arealis-arl-service`
- **Root**: `services/arl`
- **Build**: `pip install -r requirements.txt`
- **Start**: `python main_complete.py`
- **Env Vars**: `PORT = 10001`

### CRRAK Service (Simple)
- **Name**: `arealis-crrak-service`
- **Root**: `services/crrak`
- **Build**: `pip install -r requirements.txt`
- **Start**: `python main_simple.py`
- **Env Vars**: `PORT = 10002`

### PDR Service (Simple)
- **Name**: `arealis-pdr-service`
- **Root**: `services/pdr`
- **Build**: `pip install -r requirements.txt`
- **Start**: `python main.py`
- **Env Vars**: `PORT = 10003`

### RCA Service (Simple)
- **Name**: `arealis-rca-service`
- **Root**: `services/rca`
- **Build**: `pip install -r requirements.txt`
- **Start**: `python main_simple.py`
- **Env Vars**: `PORT = 10004`

---

## 🔧 Alternative Commands

### If Build Fails:
- **Build**: `pip install -r requirements.txt`
- **Start**: `gunicorn main:app --host 0.0.0.0 --port $PORT`

### If Start Fails:
- **Start**: `python gunicorn_start.py`
- **Or**: `python start.py`

---

## 🧪 Testing URLs

| Service | Health Check | API Docs |
|---------|--------------|----------|
| ACC | `https://arealis-acc-service.onrender.com/health` | `/docs` |
| ARL | `https://arealis-arl-service.onrender.com/health` | `/docs` |
| CRRAK | `https://arealis-crrak-service.onrender.com/health` | `/docs` |
| PDR | `https://arealis-pdr-service.onrender.com/health` | `/docs` |
| RCA | `https://arealis-rca-service.onrender.com/health` | `/docs` |

---

## 🚨 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| **Build fails** | Change build command to `pip install -r requirements.txt` |
| **Module not found** | Use `bash build.sh` for ACC service |
| **Port binding error** | Ensure `PORT = 10000` is set |
| **Service won't start** | Try `gunicorn main:app --host 0.0.0.0 --port $PORT` |
| **Database error** | Check all 6 environment variables are set |

---

## 📋 Deployment Order

1. **ACC Service** (most complex - test first)
2. **ARL Service** (simple)
3. **CRRAK Service** (simple)
4. **PDR Service** (simple)
5. **RCA Service** (simple)

---

## ✅ Success Indicators

- ✅ Build logs show "Build completed successfully!"
- ✅ Service logs show "Starting server on port 10000"
- ✅ Health check returns `{"status": "healthy"}`
- ✅ API docs accessible at `/docs`
- ✅ No error messages in logs

---

## 🔗 Useful Links

- **Render Dashboard**: https://dashboard.render.com
- **Repository**: https://github.com/swaroop-thakare/Magnus-Ai
- **Full Guide**: `RENDER_TEAM_DEPLOYMENT_GUIDE.md`
