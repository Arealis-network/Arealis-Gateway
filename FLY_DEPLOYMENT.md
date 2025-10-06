# Fly.io Deployment Guide

## 🚀 Deploy to Fly.io

### Step 1: Setup Fly.io
1. Go to **https://fly.io**
2. Sign up for account
3. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`

### Step 2: Create Fly.toml
Create `services/acc/fly.toml`:
```toml
app = "arealis-acc-service"
primary_region = "iad"

[build]

[env]
  DATABASE_URL = "postgresql://postgres:NmxNfLIKzWQzxwrmQUiKCouDXhcScjcD@switchyard.proxy.rlwy.net:25675/railway"
  NEO4J_URI = "neo4j+s://6933b562.databases.neo4j.io"
  NEO4J_USERNAME = "neo4j"
  NEO4J_PASSWORD = "Yavi0NJTNDApnMb-InD3pCVwdgT7Hzd2-6vb-tYshZo"
  NEO4J_DATABASE = "neo4j"
  PORT = "10000"

[[services]]
  http_checks = []
  internal_port = 10000
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [services.concurrency]
    hard_limit = 25
    soft_limit = 20
    type = "connections"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.tcp_checks]]
    grace_period = "1s"
    interval = "15s"
    restart_limit = 0
    timeout = "2s"
```

### Step 3: Deploy
```bash
cd services/acc
fly launch
fly deploy
```

## 🎯 Benefits of Fly.io
- ✅ Global edge deployment
- ✅ Fast cold starts
- ✅ Good for microservices
- ✅ Free tier available
