# 📊 ARL Agent (Account Reconciliation Ledger)

## 📋 Overview

The ARL Agent handles transaction reconciliation and ledger management for the Arealis Gateway. It provides real-time reconciliation metrics, journal entries, and exception handling for payment transactions.

## 🏗️ Architecture

- **Framework**: FastAPI
- **Data Source**: In-memory store (for demo) + ACC service integration
- **Port**: 8000
- **Workers**: 4 Gunicorn workers

## 🔧 Features

### Reconciliation Metrics
- **Today's Volume**: Total transaction volume processed
- **Success Rate**: Percentage of successful transactions
- **Average Settlement Time**: Time to settle transactions
- **Pending Approvals**: Number of transactions awaiting approval

### Journal Management
- **Journal Entries**: Track all financial transactions
- **Entry Matching**: Match transactions with bank records
- **Exception Logging**: Log reconciliation exceptions
- **CSV Export**: Export journal data for analysis

### Real-time Data Integration
- **ACC Service Integration**: Fetches real data from ACC agent
- **Dynamic Metrics**: Calculates metrics based on actual transaction data
- **Fallback Data**: Provides static data when ACC service unavailable

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the service
python main_complete.py
```

### Docker

```bash
# Build image
docker build -t arealis-arl-agent:latest .

# Run container
docker run -d \
    --name arl-agent \
    -p 8000:8000 \
    arealis-arl-agent:latest
```

## 📡 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service status and information |
| GET | `/arl/overview-metrics` | Get reconciliation overview metrics |
| GET | `/arl/ledger-recon` | Get ledger reconciliation data |

### Journal Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/arl/download-journal-csv/{journal_id}` | Download journal CSV |
| POST | `/arl/rerun-matching` | Re-run matching for unmatched entries |
| POST | `/arl/match-entry/{entry_id}` | Match a specific entry |
| POST | `/arl/attach-document/{entry_id}` | Attach document to entry |
| POST | `/arl/rematch-entry/{entry_id}` | Re-match a specific entry |
| POST | `/arl/raise-dispute/{entry_id}` | Raise dispute for entry |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service health status |

## 🔐 Authentication

Most endpoints require API key authentication via `X-API-Key` header.

**Valid API Key:**
- `arealis_api_key_2024`

## 📊 Request/Response Examples

### Get Overview Metrics

```bash
curl -X GET "http://localhost:8000/arl/overview-metrics"
```

Response:
```json
{
  "success": true,
  "data": {
    "todays_volume": {
      "value": 2847,
      "change_percent": 18.2,
      "trend": "up"
    },
    "success_rate": {
      "value": 98.7,
      "change_percent": 2.1,
      "trend": "up"
    },
    "avg_time_to_settle": {
      "value": 2.3,
      "change_percent": -5.2,
      "trend": "down"
    },
    "approvals_pending": {
      "value": 156,
      "change_percent": 12.5,
      "trend": "up"
    }
  }
}
```

### Get Ledger Reconciliation

```bash
curl -X GET "http://localhost:8000/arl/ledger-recon"
```

Response:
```json
{
  "success": true,
  "data": {
    "reconciliation_metrics": {
      "total_transactions": 2847,
      "matched_transactions": 2801,
      "unmatched_transactions": 46,
      "reconciliation_rate": 98.4
    },
    "journal_entries": [
      {
        "entry_id": "JE-001",
        "date": "2025-01-06",
        "description": "Vendor Payment - ABC Corp",
        "debit": 50000.00,
        "credit": 0.00,
        "status": "matched"
      }
    ],
    "exception_logs": [
      {
        "exception_id": "EX-001",
        "transaction_id": "TXN-12345",
        "type": "amount_mismatch",
        "description": "Payment amount differs from invoice",
        "severity": "high",
        "created_at": "2025-01-06T10:30:00Z"
      }
    ]
  }
}
```

### Download Journal CSV

```bash
curl -X POST "http://localhost:8000/arl/download-journal-csv/JRN-10001" \
  -H "X-API-Key: arealis_api_key_2024"
```

Response:
```json
{
  "success": true,
  "data": {
    "journal_id": "JRN-10001",
    "csv_content": "Journal ID,Trace ID,Stage,Rail,Account,Merchant,Amount,Status,Created At\nJRN-10001,TRC-2024-001210,REQUEST,IMPS,Ops-01,Acme Ltd,₹12,000,posted,2025-10-02 10:21:10",
    "filename": "journal_JRN-10001.csv",
    "generated_at": "2025-01-06T10:30:00Z"
  }
}
```

## 🗄️ Data Structure

### In-Memory Ledger Database

```python
ledger_db = [
    {
        "id": "JRN-10001",
        "trace": "TRC-2024-001210",
        "stage": "REQUEST",
        "rail": "IMPS",
        "account": "Ops-01",
        "merchant": "Acme Ltd",
        "amount": "₹12,000",
        "status": "posted",
        "createdAt": "2025-10-02 10:21:10"
    }
]
```

### Journal Entry Structure

```json
{
  "entry_id": "JE-001",
  "date": "2025-01-06",
  "description": "Vendor Payment - ABC Corp",
  "debit": 50000.00,
  "credit": 0.00,
  "status": "matched"
}
```

### Exception Log Structure

```json
{
  "exception_id": "EX-001",
  "transaction_id": "TXN-12345",
  "type": "amount_mismatch",
  "description": "Payment amount differs from invoice",
  "severity": "high",
  "created_at": "2025-01-06T10:30:00Z"
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
  "detail": "Invalid API Key"
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
curl http://localhost:8000/
```

Response:
```json
{
  "message": "ARL Agent Service",
  "status": "running"
}
```

### Metrics

- Reconciliation rate
- Exception count
- Processing time
- ACC service connectivity

## 🔄 Deployment

### Docker Build

```bash
docker build -t arealis-arl-agent:latest .
```

### Docker Run

```bash
docker run -d \
    --name arl-agent \
    -p 8000:8000 \
    arealis-arl-agent:latest
```

### AWS ECS

See main deployment guide for ECS configuration.

## 🛠️ Development

### Local Setup

1. Install Python 3.11+
2. Install dependencies: `pip install -r requirements.txt`
3. Run: `python main_complete.py`

### Testing

```bash
# Test service status
curl http://localhost:8000/

# Test metrics endpoint
curl http://localhost:8000/arl/overview-metrics

# Test ledger reconciliation
curl http://localhost:8000/arl/ledger-recon
```

## 📚 Documentation

- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Spec**: http://localhost:8000/openapi.json

## 🔗 Related Services

- **ACC Agent**: Source of transaction data
- **PDR Agent**: Payment routing information
- **CRRAK Agent**: Compliance reporting
- **RCA Agent**: Exception analysis

## 🎯 Key Features

### Real-time Integration
- Fetches live data from ACC service
- Calculates dynamic metrics
- Provides fallback data when needed

### Reconciliation Management
- Tracks matched and unmatched transactions
- Provides exception logging
- Supports manual matching operations

### Export Capabilities
- CSV export for journal entries
- Structured data for analysis
- Audit trail maintenance

---

**📊 The ARL Agent provides comprehensive reconciliation and ledger management capabilities, ensuring accurate financial tracking and exception handling for all payment transactions.**
