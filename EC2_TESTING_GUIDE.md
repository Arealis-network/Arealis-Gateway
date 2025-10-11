# 🖥️ EC2 Testing Guide for Arealis Gateway Backend Agents

## 📋 Overview

This guide will help you test all 5 backend agents (ACC, ARL, CRRAK, PDR, RCA) on an EC2 instance before deploying to AWS ECS. We'll build Docker images, test them locally, and verify all functionality.

## 🎯 Prerequisites

- AWS Account with EC2 access
- AWS CLI configured
- Basic knowledge of Docker and Linux commands

## 🚀 Step 1: Launch EC2 Instance

### 1.1 Launch EC2 Instance

```bash
# Launch EC2 instance (t3.medium recommended for testing)
aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --count 1 \
    --instance-type t3.medium \
    --key-name your-key-pair \
    --security-group-ids sg-your-security-group \
    --subnet-id subnet-your-subnet \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=arealis-test}]'
```

### 1.2 Get Instance Details

```bash
# Get instance IP
aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=arealis-test" \
    --query 'Reservations[*].Instances[*].[InstanceId,PublicIpAddress,State.Name]' \
    --output table
```

### 1.3 Connect to EC2 Instance

```bash
# Connect via SSH
ssh -i your-key.pem ec2-user@your-ec2-ip
```

## 🔧 Step 2: Install Prerequisites on EC2

### 2.1 Update System

```bash
# Update system packages
sudo yum update -y

# Install essential packages
sudo yum install -y git curl wget unzip
```

### 2.2 Install Docker

```bash
# Install Docker
sudo yum install -y docker

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add ec2-user to docker group
sudo usermod -a -G docker ec2-user

# Verify Docker installation
docker --version
```

### 2.3 Install AWS CLI (if not already installed)

```bash
# Download and install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify installation
aws --version
```

### 2.4 Configure AWS CLI

```bash
# Configure AWS CLI
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
# Enter your default output format (json)
```

### 2.5 Logout and Login Again

```bash
# Logout to apply group changes
exit

# SSH back in
ssh -i your-key.pem ec2-user@your-ec2-ip
```

## 📥 Step 3: Clone Repository

### 3.1 Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-username/Arealis-Gateway.git
cd Arealis-Gateway

# Verify repository structure
ls -la
ls -la services/
```

## 🐳 Step 4: Build Docker Images

### 4.1 Build ACC Agent

```bash
# Navigate to ACC service
cd services/acc

# Build Docker image
docker build -t arealis-acc-agent:latest .

# Verify image was created
docker images | grep arealis-acc-agent
```

### 4.2 Build ARL Agent

```bash
# Navigate to ARL service
cd ../arl

# Build Docker image
docker build -t arealis-arl-agent:latest .

# Verify image was created
docker images | grep arealis-arl-agent
```

### 4.3 Build CRRAK Agent

```bash
# Navigate to CRRAK service
cd ../crrak

# Build Docker image
docker build -t arealis-crrak-agent:latest .

# Verify image was created
docker images | grep arealis-crrak-agent
```

### 4.4 Build PDR Agent

```bash
# Navigate to PDR service
cd ../pdr

# Build Docker image
docker build -t arealis-pdr-agent:latest .

# Verify image was created
docker images | grep arealis-pdr-agent
```

### 4.5 Build RCA Agent

```bash
# Navigate to RCA service
cd ../rca

# Build Docker image
docker build -t arealis-rca-agent:latest .

# Verify image was created
docker images | grep arealis-rca-agent
```

### 4.6 Verify All Images

```bash
# List all Arealis images
docker images | grep arealis

# Expected output:
# arealis-acc-agent    latest    <image-id>    <time>    <size>
# arealis-arl-agent    latest    <image-id>    <time>    <size>
# arealis-crrak-agent  latest    <image-id>    <time>    <size>
# arealis-pdr-agent    latest    <image-id>    <time>    <size>
# arealis-rca-agent    latest    <image-id>    <time>    <size>
```

## 🧪 Step 5: Test Individual Services

### 5.1 Test ACC Agent

```bash
# Run ACC agent container
docker run -d \
    --name acc-agent \
    -p 8001:8000 \
    -e DATABASE_URL="postgresql://postgres:password@localhost:5432/arealis" \
    -e NEO4J_URI="neo4j://localhost:7687" \
    -e NEO4J_USERNAME="neo4j" \
    -e NEO4J_PASSWORD="password" \
    -e NEO4J_DATABASE="neo4j" \
    arealis-acc-agent:latest

# Wait for container to start
sleep 10

# Check container status
docker ps | grep acc-agent

# Check container logs
docker logs acc-agent

# Test health endpoint
curl http://localhost:8001/health

# Test service info
curl http://localhost:8001/

# Stop and remove container
docker stop acc-agent
docker rm acc-agent
```

### 5.2 Test ARL Agent

```bash
# Run ARL agent container
docker run -d \
    --name arl-agent \
    -p 8002:8000 \
    arealis-arl-agent:latest

# Wait for container to start
sleep 10

# Check container status
docker ps | grep arl-agent

# Check container logs
docker logs arl-agent

# Test service info
curl http://localhost:8002/

# Test overview metrics
curl http://localhost:8002/arl/overview-metrics

# Stop and remove container
docker stop arl-agent
docker rm arl-agent
```

### 5.3 Test CRRAK Agent

```bash
# Run CRRAK agent container
docker run -d \
    --name crrak-agent \
    -p 8003:8000 \
    arealis-crrak-agent:latest

# Wait for container to start
sleep 10

# Check container status
docker ps | grep crrak-agent

# Check container logs
docker logs crrak-agent

# Test health endpoint
curl http://localhost:8003/health

# Test service info
curl http://localhost:8003/

# Stop and remove container
docker stop crrak-agent
docker rm crrak-agent
```

### 5.4 Test PDR Agent

```bash
# Run PDR agent container
docker run -d \
    --name pdr-agent \
    -p 8004:8000 \
    arealis-pdr-agent:latest

# Wait for container to start
sleep 10

# Check container status
docker ps | grep pdr-agent

# Check container logs
docker logs pdr-agent

# Test health endpoint
curl http://localhost:8004/health

# Test service info
curl http://localhost:8004/

# Test live queue (requires API key)
curl -X GET "http://localhost:8004/pdr/live-queue" \
  -H "X-API-Key: arealis_api_key_2024"

# Stop and remove container
docker stop pdr-agent
docker rm pdr-agent
```

### 5.5 Test RCA Agent

```bash
# Run RCA agent container
docker run -d \
    --name rca-agent \
    -p 8005:8000 \
    arealis-rca-agent:latest

# Wait for container to start
sleep 10

# Check container status
docker ps | grep rca-agent

# Check container logs
docker logs rca-agent

# Test health endpoint
curl http://localhost:8005/health

# Test service info
curl http://localhost:8005/

# Test failure analysis (requires API key)
curl -X GET "http://localhost:8005/rca/failure-analysis" \
  -H "X-API-Key: arealis_api_key_2024"

# Stop and remove container
docker stop rca-agent
docker rm rca-agent
```

## 🔄 Step 6: Test All Services Together

### 6.1 Run All Services

```bash
# Run all services simultaneously
docker run -d \
    --name acc-agent \
    -p 8001:8000 \
    -e DATABASE_URL="postgresql://postgres:password@localhost:5432/arealis" \
    -e NEO4J_URI="neo4j://localhost:7687" \
    -e NEO4J_USERNAME="neo4j" \
    -e NEO4J_PASSWORD="password" \
    -e NEO4J_DATABASE="neo4j" \
    arealis-acc-agent:latest

docker run -d \
    --name arl-agent \
    -p 8002:8000 \
    arealis-arl-agent:latest

docker run -d \
    --name crrak-agent \
    -p 8003:8000 \
    arealis-crrak-agent:latest

docker run -d \
    --name pdr-agent \
    -p 8004:8000 \
    arealis-pdr-agent:latest

docker run -d \
    --name rca-agent \
    -p 8005:8000 \
    arealis-rca-agent:latest

# Wait for all services to start
sleep 15
```

### 6.2 Check All Services Status

```bash
# Check all containers
docker ps

# Check logs for all services
docker logs acc-agent
docker logs arl-agent
docker logs crrak-agent
docker logs pdr-agent
docker logs rca-agent
```

### 6.3 Test All Endpoints

```bash
# Test all health endpoints
echo "Testing ACC Agent..."
curl http://localhost:8001/health

echo "Testing ARL Agent..."
curl http://localhost:8002/

echo "Testing CRRAK Agent..."
curl http://localhost:8003/health

echo "Testing PDR Agent..."
curl http://localhost:8004/health

echo "Testing RCA Agent..."
curl http://localhost:8005/health
```

### 6.4 Test API Endpoints with Authentication

```bash
# Test ACC agent with API key
curl -X GET "http://localhost:8001/acc/decisions" \
  -H "X-API-Key: arealis_api_key_2024"

# Test ARL agent metrics
curl -X GET "http://localhost:8002/arl/overview-metrics"

# Test PDR agent live queue
curl -X GET "http://localhost:8004/pdr/live-queue" \
  -H "X-API-Key: arealis_api_key_2024"

# Test PDR agent rail health
curl -X GET "http://localhost:8004/pdr/rail-health" \
  -H "X-API-Key: arealis_api_key_2024"

# Test RCA agent failure analysis
curl -X GET "http://localhost:8005/rca/failure-analysis" \
  -H "X-API-Key: arealis_api_key_2024"
```

### 6.5 Test API Documentation

```bash
# Test API documentation endpoints
echo "ACC API Docs: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8001/docs"
echo "ARL API Docs: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8002/docs"
echo "CRRAK API Docs: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8003/docs"
echo "PDR API Docs: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8004/docs"
echo "RCA API Docs: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8005/docs"
```

## 🔍 Step 7: Performance Testing

### 7.1 Load Testing

```bash
# Install Apache Bench for load testing
sudo yum install -y httpd-tools

# Test ACC agent with multiple requests
ab -n 100 -c 10 http://localhost:8001/health

# Test ARL agent with multiple requests
ab -n 100 -c 10 http://localhost:8002/

# Test PDR agent with multiple requests
ab -n 100 -c 10 http://localhost:8004/health
```

### 7.2 Memory and CPU Usage

```bash
# Monitor resource usage
docker stats

# Check system resources
free -h
df -h
top
```

## 🧹 Step 8: Cleanup

### 8.1 Stop All Services

```bash
# Stop all containers
docker stop acc-agent arl-agent crrak-agent pdr-agent rca-agent

# Remove all containers
docker rm acc-agent arl-agent crrak-agent pdr-agent rca-agent
```

### 8.2 Clean Up Images (Optional)

```bash
# Remove all Arealis images
docker rmi arealis-acc-agent:latest arealis-arl-agent:latest arealis-crrak-agent:latest arealis-pdr-agent:latest arealis-rca-agent:latest

# Clean up unused images
docker image prune -f
```

## ✅ Step 9: Success Checklist

### 9.1 Verify All Tests Passed

- [ ] All Docker images built successfully
- [ ] All containers started without errors
- [ ] All health endpoints responding
- [ ] All API endpoints working with authentication
- [ ] API documentation accessible
- [ ] Load testing completed successfully
- [ ] No critical errors in logs
- [ ] All services responding within acceptable time

### 9.2 Expected Results

**ACC Agent:**
- Health endpoint: `{"status": "healthy", "service": "acc"}`
- Service info: `{"message": "ACC Agent Service", "status": "running"}`

**ARL Agent:**
- Service info: `{"message": "ARL Agent Service", "status": "running"}`
- Metrics endpoint returns JSON with reconciliation data

**CRRAK Agent:**
- Health endpoint: `{"status": "healthy", "service": "crrak"}`
- Service info: `{"message": "CRRAK Agent Service", "status": "running"}`

**PDR Agent:**
- Health endpoint: `{"status": "healthy", "service": "pdr"}`
- Service info: `{"message": "PDR Agent Service", "status": "running"}`
- Live queue endpoint returns JSON with queue data

**RCA Agent:**
- Health endpoint: `{"status": "healthy", "service": "rca"}`
- Service info: `{"message": "RCA Agent Service", "status": "running"}`
- Failure analysis endpoint returns JSON with analysis data

## 🚨 Troubleshooting

### Common Issues and Solutions

1. **Container fails to start**
   ```bash
   # Check logs
   docker logs container-name
   
   # Check if port is already in use
   netstat -tlnp | grep :8000
   ```

2. **Health check fails**
   ```bash
   # Check if service is running inside container
   docker exec -it container-name curl http://localhost:8000/health
   ```

3. **API key authentication fails**
   ```bash
   # Verify API key is correct
   curl -X GET "http://localhost:8000/endpoint" \
     -H "X-API-Key: arealis_api_key_2024"
   ```

4. **Database connection errors (ACC agent)**
   ```bash
   # Check environment variables
   docker exec -it acc-agent env | grep DATABASE
   ```

## 📊 Test Results Summary

After completing all tests, you should have:

- ✅ 5 Docker images built successfully
- ✅ All services running and healthy
- ✅ All API endpoints responding correctly
- ✅ Authentication working properly
- ✅ API documentation accessible
- ✅ Performance within acceptable limits
- ✅ No critical errors or failures

## 🎯 Next Steps

Once all tests pass successfully:

1. **Push images to ECR** (see ECR push guide)
2. **Deploy to ECS** (see ECS deployment guide)
3. **Set up monitoring and logging**
4. **Configure load balancer**
5. **Set up CI/CD pipeline**

---

**🎉 Congratulations! Your Arealis Gateway backend agents are now tested and ready for production deployment!**
