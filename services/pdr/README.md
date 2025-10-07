# 🚀 PDR Agent (Payment Decision & Routing)

## 📋 Overview

The PDR Agent manages payment routing and decision logic for the Arealis Gateway. It provides live queue management, rail health monitoring, and real-time payment processing capabilities.

## 🏗️ Architecture

- **Framework**: FastAPI
- **Data Source**: ACC service integration + static data
- **Port**: 8000
- **Workers**: 4 Gunicorn workers

## 🔧 Features

### Live Queue Management
- **Queue Metrics**: Real-time queue status and performance
- **Pending Payments**: Track payments awaiting processing
- **Release Queue**: Monitor payments ready for dispatch
- **Dispatched Payments**: Track completed transactions

### Rail Health Monitoring
- **Rail Performance**: Monitor IMPS, NEFT, RTGS performance
- **Health Checks**: Real-time rail connectivity status
- **Advisories**: Rail-specific recommendations and warnings
- **Cutoff Timers**: Track rail cutoff times and windows

### Transaction Management
- **Retry Logic**: Retry failed transactions
- **Cancellation**: Cancel pending transactions
- **Detailed Tracking**: Comprehensive transaction details
- **CSV Export**: Export queue data for analysis

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the service
python main.py
```

### Docker

```bash
# Build image
docker build -t arealis-pdr-agent:latest .

# Run container
docker run -d \
    --name pdr-agent \
    -p 8000:8000 \
    arealis-pdr-agent:latest
```

## 📡 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service status and information |
| GET | `/health` | Service health status |
| GET | `/pdr/live-queue` | Get live queue data |
| GET | `/pdr/rail-health` | Get rail health information |

### Transaction Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/pdr/export-csv` | Export live queue data as CSV |
| POST | `/pdr/retry-transaction/{trace_id}` | Retry a failed transaction |
| POST | `/pdr/cancel-transaction/{trace_id}` | Cancel a transaction |
| GET | `/pdr/transaction-details/{trace_id}` | Get transaction details |

### Rail Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/pdr/test-rail-connection/{rail_name}` | Test rail connection |
| POST | `/pdr/restart-rail/{rail_name}` | Restart a rail |
| GET | `/pdr/rail-metrics/{rail_name}` | Get rail metrics |

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

### Get Live Queue Data

```bash
curl -X GET "http://localhost:8000/pdr/live-queue" \
  -H "X-API-Key: arealis_api_key_2024"
```

Response:
```json
{
  "success": true,
  "data": {
    "queue_metrics": {
      "in_queue": 2847,
      "release_queue": 312,
      "success_rate": 98.7,
      "queue_change_percent": 18.2,
      "rescore_in_minutes": 2
    },
    "pending_payments": [
      {
        "id": "TXN-001",
        "amount": "₹12,000",
        "rail_candidate": "IMPS",
        "next_action": "Route",
        "age": "2m",
        "sla_status": "on_track"
      }
    ],
    "release_queue_payments": [
      {
        "id": "TXN-003",
        "amount": "₹25,000",
        "selected_rail": "RTGS",
        "rescore_at": "10:25:00",
        "shift_possible": "Yes",
        "age": "1m"
      }
    ],
    "dispatched_payments": [
      {
        "id": "TXN-004",
        "amount": "₹8,000",
        "rail": "IMPS",
        "utr": "UTR2024001230456",
        "status": "Success",
        "time": "10:20:15"
      }
    ]
  }
}
```

### Get Rail Health

```bash
curl -X GET "http://localhost:8000/pdr/rail-health" \
  -H "X-API-Key: arealis_api_key_2024"
```

Response:
```json
{
  "success": true,
  "data": {
    "rail_performance": [
      {
        "rail_name": "IMPS",
        "success_rate": 98.5,
        "avg_latency": 0.8,
        "last_updated": "2024-01-15T10:25:00Z"
      },
      {
        "rail_name": "NEFT",
        "success_rate": 92.1,
        "avg_latency": 1.2,
        "last_updated": "2024-01-15T10:25:00Z"
      },
      {
        "rail_name": "RTGS",
        "success_rate": 99.2,
        "avg_latency": 0.5,
        "last_updated": "2024-01-15T10:25:00Z"
      }
    ],
    "rail_advisories": [
      {
        "rail_name": "NEFT",
        "severity": "high",
        "message": "penalty high, window closing"
      },
      {
        "rail_name": "IMPS",
        "severity": "low",
        "message": "prefer for next 30m"
      }
    ],
    "cutoff_timers": [
      {
        "rail": "NEFT",
        "time_remaining": "In 22m",
        "tone": "warning"
      },
      {
        "rail": "RTGS",
        "time_remaining": "In 2h 10m",
        "tone": "default"
      },
      {
        "rail": "IMPS",
        "time_remaining": "No cut-off",
        "tone": "success"
      }
    ]
  }
}
```

### Get Transaction Details

```bash
curl -X GET "http://localhost:8000/pdr/transaction-details/TRC-2024-001236" \
  -H "X-API-Key: arealis_api_key_2024"
```

Response:
```json
{
  "success": true,
  "data": {
    "trace_id": "TRC-2024-001236",
    "status": "Processing",
    "amount": "₹15,000",
    "beneficiary": "Vendor A",
    "initiated_at": "2025-01-06T10:30:00Z",
    "processing_time": "2.5s",
    "current_stage": "Bank Processing",
    "stages": [
      {
        "stage": "Initiated",
        "timestamp": "2025-01-06T10:30:00Z",
        "status": "completed"
      },
      {
        "stage": "Validation",
        "timestamp": "2025-01-06T10:30:01Z",
        "status": "completed"
      },
      {
        "stage": "Bank Processing",
        "timestamp": "2025-01-06T10:30:02Z",
        "status": "in_progress"
      },
      {
        "stage": "Settlement",
        "timestamp": null,
        "status": "pending"
      }
    ],
    "error_details": null,
    "retry_count": 0
  }
}
```

### Retry Transaction

```bash
curl -X POST "http://localhost:8000/pdr/retry-transaction/TRC-2024-001236" \
  -H "X-API-Key: arealis_api_key_2024"
```

Response:
```json
{
  "success": true,
  "message": "Transaction TRC-2024-001236 retry initiated",
  "data": {
    "trace_id": "TRC-2024-001236",
    "status": "retrying",
    "retry_initiated_at": "2025-01-06T10:30:00Z"
  }
}
```

### Test Rail Connection

```bash
curl -X POST "http://localhost:8000/pdr/test-rail-connection/IMPS" \
  -H "X-API-Key: arealis_api_key_2024"
```

Response:
```json
{
  "success": true,
  "data": {
    "rail_name": "IMPS",
    "connection_status": "connected",
    "response_time": 1.2,
    "tested_at": "2025-01-06T10:30:00Z",
    "details": "Rail IMPS connection test passed"
  }
}
```

## 🗄️ Data Structure

### Queue Metrics

```json
{
  "in_queue": 2847,
  "release_queue": 312,
  "success_rate": 98.7,
  "queue_change_percent": 18.2,
  "rescore_in_minutes": 2
}
```

### Pending Payment

```json
{
  "id": "TXN-001",
  "amount": "₹12,000",
  "rail_candidate": "IMPS",
  "next_action": "Route",
  "age": "2m",
  "sla_status": "on_track"
}
```

### Rail Performance

```json
{
  "rail_name": "IMPS",
  "success_rate": 98.5,
  "avg_latency": 0.8,
  "last_updated": "2024-01-15T10:25:00Z"
}
```

### Transaction Stages

```json
{
  "stage": "Bank Processing",
  "timestamp": "2025-01-06T10:30:02Z",
  "status": "in_progress"
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
  "message": "Error fetching real data: Connection refused"
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
  "service": "pdr"
}
```

### Metrics

- Queue processing time
- Rail success rates
- Transaction retry rates
- Rail response times

## 🔄 Deployment

### Docker Build

```bash
docker build -t arealis-pdr-agent:latest .
```

### Docker Run

```bash
docker run -d \
    --name pdr-agent \
    -p 8000:8000 \
    arealis-pdr-agent:latest
```

### AWS ECS

See main deployment guide for ECS configuration.

## 🛠️ Development

### Local Setup

1. Install Python 3.11+
2. Install dependencies: `pip install -r requirements.txt`
3. Run: `python main.py`

### Testing

```bash
# Test service status
curl http://localhost:8000/

# Test health endpoint
curl http://localhost:8000/health

# Test live queue
curl -X GET "http://localhost:8000/pdr/live-queue" \
  -H "X-API-Key: arealis_api_key_2024"

# Test rail health
curl -X GET "http://localhost:8000/pdr/rail-health" \
  -H "X-API-Key: arealis_api_key_2024"
```

## 📚 Documentation

- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Spec**: http://localhost:8000/openapi.json

## 🔗 Related Services

- **ACC Agent**: Source of transaction data
- **ARL Agent**: Reconciliation information
- **CRRAK Agent**: Compliance reporting
- **RCA Agent**: Failure analysis

## 🎯 Key Features

### Real-time Queue Management
- Live queue monitoring
- Performance metrics
- SLA tracking
- Automatic rescoring

### Rail Health Monitoring
- Real-time rail status
- Performance metrics
- Advisory system
- Cutoff time tracking

### Transaction Lifecycle
- Complete transaction tracking
- Retry mechanisms
- Cancellation support
- Detailed stage monitoring

### Export and Analysis
- CSV export capabilities
- Performance analytics
- Historical data access
- Audit trail maintenance

---

**🚀 The PDR Agent is the routing engine of the Arealis Gateway, ensuring optimal payment routing and real-time monitoring of transaction processing across all banking rails.**
