# Render Deployment Checklist

## ✅ Pre-Deployment Setup

- [ ] Render account created
- [ ] GitHub repository connected to Render
- [ ] Database credentials verified
- [ ] All service files committed to repository

## 🚀 Service Deployment Order

### 1. ACC Service (Priority: High)
- [ ] Create new Web Service in Render
- [ ] Name: `arealis-acc-service`
- [ ] Root Directory: `services/acc`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `gunicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Environment Variables:
  - [ ] `DATABASE_URL`
  - [ ] `NEO4J_URI`
  - [ ] `NEO4J_USERNAME`
  - [ ] `NEO4J_PASSWORD`
  - [ ] `NEO4J_DATABASE`
  - [ ] `PORT=10000`
- [ ] Deploy and test: `https://arealis-acc-service.onrender.com/health`

### 2. ARL Service
- [ ] Create new Web Service in Render
- [ ] Name: `arealis-arl-service`
- [ ] Root Directory: `services/arl`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `gunicorn main_complete:app --host 0.0.0.0 --port $PORT`
- [ ] Environment Variables:
  - [ ] `PORT=10001`
- [ ] Deploy and test: `https://arealis-arl-service.onrender.com/health`

### 3. CRRAK Service
- [ ] Create new Web Service in Render
- [ ] Name: `arealis-crrak-service`
- [ ] Root Directory: `services/crrak`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `gunicorn main_simple:app --host 0.0.0.0 --port $PORT`
- [ ] Environment Variables:
  - [ ] `PORT=10002`
- [ ] Deploy and test: `https://arealis-crrak-service.onrender.com/health`

### 4. PDR Service
- [ ] Create new Web Service in Render
- [ ] Name: `arealis-pdr-service`
- [ ] Root Directory: `services/pdr`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `gunicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Environment Variables:
  - [ ] `PORT=10003`
- [ ] Deploy and test: `https://arealis-pdr-service.onrender.com/health`

### 5. RCA Service
- [ ] Create new Web Service in Render
- [ ] Name: `arealis-rca-service`
- [ ] Root Directory: `services/rca`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `gunicorn main_simple:app --host 0.0.0.0 --port $PORT`
- [ ] Environment Variables:
  - [ ] `PORT=10004`
- [ ] Deploy and test: `https://arealis-rca-service.onrender.com/health`

## 🔍 Post-Deployment Testing

### Health Checks
- [ ] ACC Service: `GET https://arealis-acc-service.onrender.com/health`
- [ ] ARL Service: `GET https://arealis-arl-service.onrender.com/health`
- [ ] CRRAK Service: `GET https://arealis-crrak-service.onrender.com/health`
- [ ] PDR Service: `GET https://arealis-pdr-service.onrender.com/health`
- [ ] RCA Service: `GET https://arealis-rca-service.onrender.com/health`

### API Documentation
- [ ] ACC Service: `https://arealis-acc-service.onrender.com/docs`
- [ ] ARL Service: `https://arealis-arl-service.onrender.com/docs`
- [ ] CRRAK Service: `https://arealis-crrak-service.onrender.com/docs`
- [ ] PDR Service: `https://arealis-pdr-service.onrender.com/docs`
- [ ] RCA Service: `https://arealis-rca-service.onrender.com/docs`

### Integration Testing
- [ ] Test ACC service database connections
- [ ] Test ARL service ledger operations
- [ ] Test CRRAK service audit filings
- [ ] Test PDR service live queue
- [ ] Test RCA service analysis endpoints

## 📊 Monitoring Setup

- [ ] Set up Render service monitoring
- [ ] Configure health check alerts
- [ ] Monitor database connection status
- [ ] Track API response times
- [ ] Set up error rate monitoring

## 🔧 Troubleshooting

### Common Issues
- [ ] Build failures: Check requirements.txt
- [ ] Database connection errors: Verify environment variables
- [ ] CORS issues: Check middleware configuration
- [ ] Port binding errors: Ensure PORT variable is set
- [ ] Memory issues: Monitor resource usage

### Logs to Check
- [ ] Build logs for dependency issues
- [ ] Runtime logs for application errors
- [ ] Database connection logs
- [ ] API request/response logs

## 📝 Notes

- All services use FastAPI with automatic API documentation
- CORS is configured for production use
- API keys are required for protected endpoints
- Services are stateless and can be scaled horizontally
- Database connections are pooled for efficiency

## 🎯 Success Criteria

- [ ] All 5 services deployed successfully
- [ ] All health checks passing
- [ ] API documentation accessible
- [ ] Database connections working
- [ ] No critical errors in logs
- [ ] Response times under 2 seconds
