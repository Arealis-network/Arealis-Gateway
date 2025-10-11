# 🔍 RCA Agent (Root Cause Analysis)

## 📋 Overview

The RCA Agent performs failure analysis and diagnostics for the Arealis Gateway. It analyzes failed transactions, identifies root causes, and provides actionable insights for system improvement.

## 🏗️ Architecture

- **Framework**: FastAPI
- **Data Source**: Static data + integration capabilities
- **Port**: 8000
- **Workers**: 4 Gunicorn workers

## 🔧 Features

### Failure Analysis
- **Transaction Failures**: Analyze failed payment transactions
- **Root Cause Identification**: Identify underlying causes of failures
- **Pattern Recognition**: Detect failure patterns and trends
- **Impact Assessment**: Assess impact of failures on system performance

### Diagnostic Capabilities
- **System Diagnostics**: Perform system health checks
- **Performance Analysis**: Analyze system performance metrics
- **Error Classification**: Classify and categorize errors
- **Trend Analysis**: Track failure trends over time

### Reporting and Insights
- **Failure Reports**: Generate detailed failure analysis reports
- **Recommendations**: Provide actionable recommendations
- **Alert Generation**: Generate alerts for critical failures
- **Dashboard Data**: Provide data for monitoring dashboards

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the service
python main_simple.py
```

### Docker

```bash
# Build image
docker build -t arealis-rca-agent:latest .

# Run container
docker run -d \
    --name rca-agent \
    -p 8000:8000 \
    arealis-rca-agent:latest
```

## 📡 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service status and information |
| GET | `/health` | Service health status |

### Failure Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rca/failure-analysis` | Get failure analysis data |
| POST | `/rca/analyze-failure` | Analyze specific failure |
| GET | `/rca/failure-patterns` | Get failure patterns |
| GET | `/rca/failure-trends` | Get failure trends |

### Root Cause Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/rca/root-cause-analysis` | Perform root cause analysis |
| GET | `/rca/root-causes` | Get root cause data |
| POST | `/rca/classify-error` | Classify error type |
| GET | `/rca/error-categories` | Get error categories |

### System Diagnostics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rca/system-health` | Get system health status |
| POST | `/rca/run-diagnostics` | Run system diagnostics |
| GET | `/rca/performance-metrics` | Get performance metrics |
| GET | `/rca/alert-status` | Get alert status |

### Reporting

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rca/failure-reports` | Get failure reports |
| POST | `/rca/generate-report` | Generate failure report |
| GET | `/rca/recommendations` | Get improvement recommendations |
| POST | `/rca/export-analysis` | Export analysis data |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health status |

## 🔐 Authentication

All endpoints require API key authentication via `X-API-Key` header.

**Valid API Keys:**
- `arealis_api_key_2024`
- `test_api_key_123`
- `demo_key_456`
- `production_key_789`

## 📊 Request/Response Examples

### Get Failure Analysis

```bash
curl -X GET "http://localhost:8000/rca/failure-analysis" \
  -H "X-API-Key: arealis_api_key_2024"
```

Response:
```json
{
  "success": true,
  "data": {
    "failure_summary": {
      "total_failures": 25,
      "failure_rate": 1.6,
      "critical_failures": 3,
      "resolved_failures": 22
    },
    "failure_breakdown": [
      {
        "failure_type": "bank_connection_timeout",
        "count": 12,
        "percentage": 48.0,
        "severity": "high"
      },
      {
        "failure_type": "invalid_account_details",
        "count": 8,
        "percentage": 32.0,
        "severity": "medium"
      },
      {
        "failure_type": "policy_violation",
        "count": 5,
        "percentage": 20.0,
        "severity": "low"
      }
    ],
    "recent_failures": [
      {
        "failure_id": "F-001",
        "transaction_id": "TXN-12345",
        "failure_type": "bank_connection_timeout",
        "timestamp": "2025-01-06T10:30:00Z",
        "status": "analyzed",
        "root_cause": "Network connectivity issue"
      }
    ]
  }
}
```

### Perform Root Cause Analysis

```bash
curl -X POST "http://localhost:8000/rca/root-cause-analysis" \
  -H "X-API-Key: arealis_api_key_2024" \
  -H "Content-Type: application/json" \
  -d '{
    "failure_id": "F-001",
    "transaction_id": "TXN-12345",
    "failure_type": "bank_connection_timeout"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "failure_id": "F-001",
    "transaction_id": "TXN-12345",
    "root_cause": {
      "primary_cause": "Network connectivity issue",
      "secondary_causes": [
        "Bank server overload",
        "DNS resolution failure"
      ],
      "contributing_factors": [
        "High transaction volume",
        "Peak hour processing"
      ]
    },
    "analysis_details": {
      "error_code": "CONN_TIMEOUT",
      "error_message": "Connection timeout after 30 seconds",
      "affected_components": ["bank_connector", "network_layer"],
      "impact_assessment": "Medium - Affects 5% of transactions"
    },
    "recommendations": [
      {
        "priority": "high",
        "action": "Implement connection pooling",
        "description": "Add connection pooling to reduce connection overhead"
      },
      {
        "priority": "medium",
        "action": "Increase timeout values",
        "description": "Increase timeout from 30s to 60s for bank connections"
      }
    ],
    "confidence_score": 0.85
  }
}
```

### Get Failure Patterns

```bash
curl -X GET "http://localhost:8000/rca/failure-patterns" \
  -H "X-API-Key: arealis_api_key_2024"
```

Response:
```json
{
  "success": true,
  "data": {
    "patterns": [
      {
        "pattern_id": "P-001",
        "pattern_name": "Peak Hour Failures",
        "description": "Increased failures during 10-11 AM and 2-3 PM",
        "frequency": "daily",
        "affected_transactions": 45,
        "severity": "medium"
      },
      {
        "pattern_id": "P-002",
        "pattern_name": "Bank-Specific Issues",
        "description": "Higher failure rate for specific bank connections",
        "frequency": "ongoing",
        "affected_transactions": 23,
        "severity": "high"
      }
    ],
    "pattern_analysis": {
      "total_patterns": 5,
      "active_patterns": 3,
      "resolved_patterns": 2
    }
  }
}
```

### Get System Health

```bash
curl -X GET "http://localhost:8000/rca/system-health" \
  -H "X-API-Key: arealis_api_key_2024"
```

Response:
```json
{
  "success": true,
  "data": {
    "overall_health": "good",
    "health_score": 87.5,
    "component_status": [
      {
        "component": "database",
        "status": "healthy",
        "response_time": "45ms",
        "last_check": "2025-01-06T10:30:00Z"
      },
      {
        "component": "bank_connector",
        "status": "degraded",
        "response_time": "2.5s",
        "last_check": "2025-01-06T10:30:00Z",
        "issues": ["High response time", "Occasional timeouts"]
      },
      {
        "component": "policy_engine",
        "status": "healthy",
        "response_time": "120ms",
        "last_check": "2025-01-06T10:30:00Z"
      }
    ],
    "alerts": [
      {
        "alert_id": "A-001",
        "type": "performance",
        "severity": "warning",
        "message": "Bank connector response time above threshold",
        "timestamp": "2025-01-06T10:25:00Z"
      }
    ]
  }
}
```

### Get Recommendations

```bash
curl -X GET "http://localhost:8000/rca/recommendations" \
  -H "X-API-Key: arealis_api_key_2024"
```

Response:
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "recommendation_id": "R-001",
        "priority": "high",
        "category": "performance",
        "title": "Implement Connection Pooling",
        "description": "Add connection pooling to reduce connection overhead and improve response times",
        "impact": "Reduce connection timeouts by 60%",
        "effort": "medium",
        "status": "pending"
      },
      {
        "recommendation_id": "R-002",
        "priority": "medium",
        "category": "reliability",
        "title": "Add Circuit Breaker Pattern",
        "description": "Implement circuit breaker pattern for bank connections to prevent cascade failures",
        "impact": "Improve system resilience",
        "effort": "high",
        "status": "pending"
      }
    ],
    "summary": {
      "total_recommendations": 8,
      "high_priority": 3,
      "medium_priority": 4,
      "low_priority": 1,
      "implemented": 2
    }
  }
}
```

## 🗄️ Data Structure

### Failure Analysis

```json
{
  "failure_id": "F-001",
  "transaction_id": "TXN-12345",
  "failure_type": "bank_connection_timeout",
  "timestamp": "2025-01-06T10:30:00Z",
  "status": "analyzed",
  "root_cause": "Network connectivity issue"
}
```

### Root Cause Analysis

```json
{
  "primary_cause": "Network connectivity issue",
  "secondary_causes": [
    "Bank server overload",
    "DNS resolution failure"
  ],
  "contributing_factors": [
    "High transaction volume",
    "Peak hour processing"
  ]
}
```

### Failure Pattern

```json
{
  "pattern_id": "P-001",
  "pattern_name": "Peak Hour Failures",
  "description": "Increased failures during 10-11 AM and 2-3 PM",
  "frequency": "daily",
  "affected_transactions": 45,
  "severity": "medium"
}
```

### System Health

```json
{
  "component": "bank_connector",
  "status": "degraded",
  "response_time": "2.5s",
  "last_check": "2025-01-06T10:30:00Z",
  "issues": ["High response time", "Occasional timeouts"]
}
```

### Recommendation

```json
{
  "recommendation_id": "R-001",
  "priority": "high",
  "category": "performance",
  "title": "Implement Connection Pooling",
  "description": "Add connection pooling to reduce connection overhead",
  "impact": "Reduce connection timeouts by 60%",
  "effort": "medium",
  "status": "pending"
}
```

## 🔧 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Service port | No | 8000 |

## 🚨 Error Handling

### Common Error Responses

```json
{
  "detail": "API key required"
}
```

```json
{
  "detail": "Invalid API key"
}
```

```json
{
  "success": false,
  "message": "Error analyzing failure: Invalid failure ID"
}
```

## 📈 Monitoring

### Health Check

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "service": "rca"
}
```

### Metrics

- Failure analysis time
- Root cause identification accuracy
- System health monitoring
- Recommendation effectiveness

## 🔄 Deployment

### Docker Build

```bash
docker build -t arealis-rca-agent:latest .
```

### Docker Run

```bash
docker run -d \
    --name rca-agent \
    -p 8000:8000 \
    arealis-rca-agent:latest
```

### AWS ECS

See main deployment guide for ECS configuration.

## 🛠️ Development

### Local Setup

1. Install Python 3.11+
2. Install dependencies: `pip install -r requirements.txt`
3. Run: `python main_simple.py`

### Testing

```bash
# Test service status
curl http://localhost:8000/

# Test health endpoint
curl http://localhost:8000/health

# Test failure analysis
curl -X GET "http://localhost:8000/rca/failure-analysis" \
  -H "X-API-Key: arealis_api_key_2024"

# Test system health
curl -X GET "http://localhost:8000/rca/system-health" \
  -H "X-API-Key: arealis_api_key_2024"
```

## 📚 Documentation

- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Spec**: http://localhost:8000/openapi.json

## 🔗 Related Services

- **ACC Agent**: Source of failure data
- **ARL Agent**: Reconciliation failures
- **PDR Agent**: Routing failures
- **CRRAK Agent**: Compliance failures

## 🎯 Key Features

### Failure Analysis
- Comprehensive failure tracking
- Pattern recognition
- Trend analysis
- Impact assessment

### Root Cause Analysis
- Multi-level cause analysis
- Contributing factor identification
- Confidence scoring
- Actionable insights

### System Diagnostics
- Real-time health monitoring
- Performance analysis
- Component status tracking
- Alert generation

### Recommendations
- Prioritized recommendations
- Impact assessment
- Effort estimation
- Implementation tracking

---

**🔍 The RCA Agent provides comprehensive failure analysis and root cause identification capabilities, helping maintain system reliability and performance in the Arealis Gateway.**
