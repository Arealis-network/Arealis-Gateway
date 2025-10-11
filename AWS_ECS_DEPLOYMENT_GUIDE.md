# 🚀 AWS ECS Deployment Guide for Arealis Gateway Backend Agents

## 📋 Overview

This guide will help you deploy all 5 backend agents (ACC, ARL, CRRAK, PDR, RCA) to AWS ECS using Docker containers. We'll test on EC2 first, then deploy to ECS.

## 🎯 Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Docker installed locally
- Git repository access

## 📦 Step 1: Prepare Your Environment

### 1.1 Install Prerequisites on Your Local Machine

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install Docker
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker $USER

# Install Git
sudo yum install -y git
```

### 1.2 Configure AWS CLI

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
# Enter your default output format (json)
```

## 🖥️ Step 2: Launch EC2 Instance for Testing

### 2.1 Launch EC2 Instance

```bash
# Launch EC2 instance (t3.medium recommended)
aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --count 1 \
    --instance-type t3.medium \
    --key-name your-key-pair \
    --security-group-ids sg-your-security-group \
    --subnet-id subnet-your-subnet \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=arealis-test}]'
```

### 2.2 Connect to EC2 Instance

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### 2.3 Install Docker on EC2

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Git
sudo yum install -y git

# Install curl for health checks
sudo yum install -y curl

# Logout and login again to apply group changes
exit
# SSH back in
```

## 🐳 Step 3: Build and Test Docker Images

### 3.1 Clone Repository on EC2

```bash
git clone https://github.com/your-username/Arealis-Gateway.git
cd Arealis-Gateway
```

### 3.2 Build ACC Agent Docker Image

```bash
cd services/acc
docker build -t arealis-acc-agent:latest .
```

### 3.3 Test ACC Agent

```bash
# Run ACC agent container
docker run -d \
    --name acc-agent \
    -p 8001:8000 \
    -e DATABASE_URL="postgresql://postgres:password@your-db-host:5432/arealis" \
    -e NEO4J_URI="neo4j+s://your-neo4j-host:7687" \
    -e NEO4J_USERNAME="neo4j" \
    -e NEO4J_PASSWORD="your-neo4j-password" \
    -e NEO4J_DATABASE="neo4j" \
    arealis-acc-agent:latest

# Check if container is running
docker ps

# Test health endpoint
curl http://localhost:8001/health

# Check logs
docker logs acc-agent
```

### 3.4 Build and Test Other Agents

```bash
# ARL Agent
cd ../arl
docker build -t arealis-arl-agent:latest .
docker run -d --name arl-agent -p 8002:8000 arealis-arl-agent:latest
curl http://localhost:8002/

# CRRAK Agent
cd ../crrak
docker build -t arealis-crrak-agent:latest .
docker run -d --name crrak-agent -p 8003:8000 arealis-crrak-agent:latest
curl http://localhost:8003/health

# PDR Agent
cd ../pdr
docker build -t arealis-pdr-agent:latest .
docker run -d --name pdr-agent -p 8004:8000 arealis-pdr-agent:latest
curl http://localhost:8004/health

# RCA Agent
cd ../rca
docker build -t arealis-rca-agent:latest .
docker run -d --name rca-agent -p 8005:8000 arealis-rca-agent:latest
curl http://localhost:8005/health
```

### 3.5 Test All Services

```bash
# Test all endpoints
curl http://localhost:8001/health  # ACC
curl http://localhost:8002/        # ARL
curl http://localhost:8003/health  # CRRAK
curl http://localhost:8004/health  # PDR
curl http://localhost:8005/health  # RCA

# Check all containers
docker ps
```

## 🏗️ Step 4: Create ECR Repositories

### 4.1 Create ECR Repositories

```bash
# Create ECR repositories for each agent
aws ecr create-repository --repository-name arealis-acc-agent
aws ecr create-repository --repository-name arealis-arl-agent
aws ecr create-repository --repository-name arealis-crrak-agent
aws ecr create-repository --repository-name arealis-pdr-agent
aws ecr create-repository --repository-name arealis-rca-agent
```

### 4.2 Get ECR Login Token

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com
```

## 📤 Step 5: Push Images to ECR

### 5.1 Tag and Push ACC Agent

```bash
# Tag image
docker tag arealis-acc-agent:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/arealis-acc-agent:latest

# Push to ECR
docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/arealis-acc-agent:latest
```

### 5.2 Tag and Push All Other Agents

```bash
# ARL Agent
docker tag arealis-arl-agent:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/arealis-arl-agent:latest
docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/arealis-arl-agent:latest

# CRRAK Agent
docker tag arealis-crrak-agent:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/arealis-crrak-agent:latest
docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/arealis-crrak-agent:latest

# PDR Agent
docker tag arealis-pdr-agent:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/arealis-pdr-agent:latest
docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/arealis-pdr-agent:latest

# RCA Agent
docker tag arealis-rca-agent:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/arealis-rca-agent:latest
docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/arealis-rca-agent:latest
```

## 🚀 Step 6: Deploy to ECS

### 6.1 Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name arealis-backend-cluster
```

### 6.2 Create Task Definitions

Create task definition files for each agent:

#### ACC Agent Task Definition (acc-task-definition.json)

```json
{
  "family": "arealis-acc-agent",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::your-account-id:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "acc-agent",
      "image": "your-account-id.dkr.ecr.us-east-1.amazonaws.com/arealis-acc-agent:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://postgres:password@your-db-host:5432/arealis"
        },
        {
          "name": "NEO4J_URI",
          "value": "neo4j+s://your-neo4j-host:7687"
        },
        {
          "name": "NEO4J_USERNAME",
          "value": "neo4j"
        },
        {
          "name": "NEO4J_PASSWORD",
          "value": "your-neo4j-password"
        },
        {
          "name": "NEO4J_DATABASE",
          "value": "neo4j"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/arealis-acc-agent",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

### 6.3 Register Task Definitions

```bash
# Register ACC task definition
aws ecs register-task-definition --cli-input-json file://acc-task-definition.json

# Create similar task definitions for other agents and register them
aws ecs register-task-definition --cli-input-json file://arl-task-definition.json
aws ecs register-task-definition --cli-input-json file://crrak-task-definition.json
aws ecs register-task-definition --cli-input-json file://pdr-task-definition.json
aws ecs register-task-definition --cli-input-json file://rca-task-definition.json
```

### 6.4 Create ECS Services

```bash
# Create ACC service
aws ecs create-service \
    --cluster arealis-backend-cluster \
    --service-name acc-service \
    --task-definition arealis-acc-agent:1 \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-your-subnet],securityGroups=[sg-your-security-group],assignPublicIp=ENABLED}"

# Create other services similarly
aws ecs create-service \
    --cluster arealis-backend-cluster \
    --service-name arl-service \
    --task-definition arealis-arl-agent:1 \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-your-subnet],securityGroups=[sg-your-security-group],assignPublicIp=ENABLED}"
```

## 🔍 Step 7: Monitor and Test Deployment

### 7.1 Check Service Status

```bash
# List services
aws ecs list-services --cluster arealis-backend-cluster

# Describe service
aws ecs describe-services --cluster arealis-backend-cluster --services acc-service

# List tasks
aws ecs list-tasks --cluster arealis-backend-cluster --service-name acc-service
```

### 7.2 Get Service Endpoints

```bash
# Get task details
aws ecs describe-tasks --cluster arealis-backend-cluster --tasks task-arn

# Test endpoints (replace with actual IPs)
curl http://your-acc-service-ip:8000/health
curl http://your-arl-service-ip:8000/
curl http://your-crrak-service-ip:8000/health
curl http://your-pdr-service-ip:8000/health
curl http://your-rca-service-ip:8000/health
```

## 🛠️ Step 8: Setup Load Balancer (Optional)

### 8.1 Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
    --name arealis-backend-alb \
    --subnets subnet-your-subnet-1 subnet-your-subnet-2 \
    --security-groups sg-your-alb-security-group
```

### 8.2 Create Target Groups

```bash
# Create target group for ACC service
aws elbv2 create-target-group \
    --name acc-target-group \
    --protocol HTTP \
    --port 8000 \
    --vpc-id vpc-your-vpc-id \
    --target-type ip \
    --health-check-path /health
```

## 📊 Step 9: Monitoring and Logging

### 9.1 Create CloudWatch Log Groups

```bash
# Create log groups for each service
aws logs create-log-group --log-group-name /ecs/arealis-acc-agent
aws logs create-log-group --log-group-name /ecs/arealis-arl-agent
aws logs create-log-group --log-group-name /ecs/arealis-crrak-agent
aws logs create-log-group --log-group-name /ecs/arealis-pdr-agent
aws logs create-log-group --log-group-name /ecs/arealis-rca-agent
```

### 9.2 Setup CloudWatch Alarms

```bash
# Create alarm for ACC service
aws cloudwatch put-metric-alarm \
    --alarm-name "ACC-Service-High-CPU" \
    --alarm-description "ACC Service High CPU Usage" \
    --metric-name CPUUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=ServiceName,Value=acc-service Name=ClusterName,Value=arealis-backend-cluster
```

## 🔧 Troubleshooting

### Common Issues and Solutions

1. **Container fails to start**
   ```bash
   # Check logs
   aws logs get-log-events --log-group-name /ecs/arealis-acc-agent --log-stream-name ecs/acc-agent/task-id
   ```

2. **Health check failures**
   ```bash
   # Check if health endpoint is accessible
   curl -f http://localhost:8000/health
   ```

3. **Database connection issues**
   ```bash
   # Verify environment variables
   aws ecs describe-task-definition --task-definition arealis-acc-agent:1
   ```

## 🎯 Success Checklist

- [ ] All Docker images built successfully
- [ ] All containers tested on EC2
- [ ] All images pushed to ECR
- [ ] ECS cluster created
- [ ] All task definitions registered
- [ ] All services created and running
- [ ] Health checks passing
- [ ] Load balancer configured (if needed)
- [ ] Monitoring and logging setup
- [ ] All endpoints accessible

## 📞 Support

If you encounter any issues:

1. Check CloudWatch logs
2. Verify security group rules
3. Check task definition configuration
4. Ensure all environment variables are set correctly
5. Verify ECR repository permissions

---

**🎉 Congratulations! Your Arealis Gateway backend agents are now deployed on AWS ECS!**
