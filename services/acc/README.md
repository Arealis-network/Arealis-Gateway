# 🛡️ ACC Agent (Autonomous Compliance Agent)

## 📋 Overview

The ACC Agent is the most complex service in the Arealis Gateway, handling regulatory compliance and risk assessment for payment transactions. It integrates with multiple verification services and uses OPA (Open Policy Agent) for policy-based decision making.

## 🏗️ Architecture

- **Framework**: FastAPI
- **Database**: PostgreSQL + Neo4j
- **Policy Engine**: OPA (Open Policy Agent)
- **Port**: 8000
- **Workers**: 4 Gunicorn workers

## 🔧 Features

### Verification Services
- **PAN Verification**: Validates PAN numbers using Setu API format
- **GSTIN Verification**: Validates GST numbers using Cashfree API format
- **Bank Verification**: Validates bank account details
- **Aadhaar Verification**: Validates Aadhaar numbers
- **CIBIL Check**: Credit score verification for loans

### Policy Engine Integration
- **OPA Integration**: Calls OPA server for compliance decisions
- **Policy Version**: acc-1.4.2
- **Decision Making**: PASS/FAIL based on policy violations

### Data Storage
- **PostgreSQL**: Transaction records and decisions
- **Neo4j**: Graph relationships and evidence trails

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://user:pass@localhost:5432/arealis"
export NEO4J_URI="neo4j://localhost:7687"
export NEO4J_USERNAME="neo4j"
export NEO4J_PASSWORD="password"
export NEO4J_DATABASE="neo4j"

# Run the service
python main.py
```

### Docker

```bash
# Build image
docker build -t arealis-acc-agent:latest .

# Run container
docker run -d \
    --name acc-agent \
    -p 8000:8000 \
    -e DATABASE_URL="postgresql://user:pass@host:5432/arealis" \
    -e NEO4J_URI="neo4j://host:7687" \
    -e NEO4J_USERNAME="neo4j" \
    -e NEO4J_PASSWORD="password" \
    -e NEO4J_DATABASE="neo4j" \
    arealis-acc-agent:latest
```

## 📡 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/acc/decide` | Process payment transactions for compliance |
| POST | `/acc/payment-file` | Save payment file data |
| GET | `/acc/decisions` | Get all ACC agent decisions |
| GET | `/acc/payment-files` | Get payment files with pagination |
| GET | `/acc/payment-files/{file_id}` | Get specific payment file |
| GET | `/acc/payment-files/latest` | Get latest payment files |
| GET | `/acc/payment-files/count` | Get total count of payment files |

### Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/acc/vendor-payments` | Get vendor payment dashboard data |
| GET | `/acc/payroll-data` | Get payroll dashboard data |
| GET | `/acc/loan-disbursement-data` | Get loan disbursement dashboard data |

### Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/acc/approve-payment/{payment_id}` | Approve a payment |
| PUT | `/acc/reject-payment/{payment_id}` | Reject a payment |
| POST | `/acc/bulk-approve` | Bulk approve payments |
| POST | `/acc/bulk-reject` | Bulk reject payments |
| DELETE | `/acc/clear-vendor-data` | Clear vendor payment data |
| DELETE | `/acc/clear-payroll-data` | Clear payroll data |
| DELETE | `/acc/clear-loan-data` | Clear loan disbursement data |
| DELETE | `/acc/clear-data` | Clear all ACC data |

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

### Process Transactions

```bash
curl -X POST "http://localhost:8000/acc/decide" \
  -H "X-API-Key: arealis_api_key_2024" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "payment_type": "vendor_payment",
      "transaction_id": "VEN001",
      "sender": {
        "name": "ABC Corp",
        "account_number": "1234567890",
        "ifsc_code": "HDFC0001234",
        "bank_name": "HDFC Bank"
      },
      "receiver": {
        "name": "Vendor XYZ",
        "account_number": "9876543210",
        "ifsc_code": "SBIN0001234",
        "bank_name": "State Bank of India"
      },
      "amount": 50000,
      "currency": "INR",
      "method": "NEFT",
      "purpose": "Vendor Payment",
      "schedule_datetime": "2025-01-06T10:00:00Z",
      "location": {
        "city": "Mumbai",
        "gps_coordinates": {
          "latitude": 19.076,
          "longitude": 72.8777
        }
      },
      "additional_fields": {
        "invoice_number": "INV001",
        "invoice_date": "2025-01-05",
        "gst_number": "29ABCDE1234F1Z5",
        "pan_number": "ABCDE1234A",
        "vendor_code": "VENDOR001"
      }
    }
  ]'
```

### Response

```json
{
  "decisions": [
    {
      "line_id": "VEN001",
      "decision": "PASS",
      "policy_version": "acc-1.4.2",
      "reasons": [],
      "evidence_refs": ["pan", "gstin", "bank"],
      "postgres_id": 123,
      "neo4j_success": true
    }
  ]
}
```

## 🗄️ Database Schema

### PostgreSQL Tables

#### acc_agent
```sql
CREATE TABLE acc_agent (
    id SERIAL PRIMARY KEY,
    line_id VARCHAR(255) NOT NULL,
    beneficiary VARCHAR(255),
    ifsc VARCHAR(255),
    amount DECIMAL(15,2),
    policy_version VARCHAR(50),
    status VARCHAR(50),
    decision_reason TEXT,
    evidence_ref TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### payment_files
```sql
CREATE TABLE payment_files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Neo4j Graph Structure

```
(Transaction)-[:HAS_EVIDENCE]->(Evidence)
(Transaction)-[:HAS_DECISION]->(Decision)
(Transaction)-[:INVOLVES]->(Party)
```

## 🔧 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `NEO4J_URI` | Neo4j connection URI | Yes | - |
| `NEO4J_USERNAME` | Neo4j username | Yes | - |
| `NEO4J_PASSWORD` | Neo4j password | Yes | - |
| `NEO4J_DATABASE` | Neo4j database name | Yes | neo4j |
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
  "detail": "Database connection failed"
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
  "service": "acc"
}
```

### Metrics

- Transaction processing time
- Policy evaluation time
- Database connection status
- OPA server response time

## 🔄 Deployment

### Docker Build

```bash
docker build -t arealis-acc-agent:latest .
```

### Docker Run

```bash
docker run -d \
    --name acc-agent \
    -p 8000:8000 \
    -e DATABASE_URL="postgresql://user:pass@host:5432/arealis" \
    -e NEO4J_URI="neo4j://host:7687" \
    -e NEO4J_USERNAME="neo4j" \
    -e NEO4J_PASSWORD="password" \
    -e NEO4J_DATABASE="neo4j" \
    arealis-acc-agent:latest
```

### AWS ECS

See main deployment guide for ECS configuration.

## 🛠️ Development

### Local Setup

1. Install Python 3.11+
2. Install dependencies: `pip install -r requirements.txt`
3. Set up PostgreSQL and Neo4j databases
4. Set environment variables
5. Run: `python main.py`

### Testing

```bash
# Run tests
python -m pytest tests/

# Test specific endpoint
curl -X GET "http://localhost:8000/health"
```

## 📚 Documentation

- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Spec**: http://localhost:8000/openapi.json

## 🔗 Related Services

- **ARL Agent**: Ledger reconciliation
- **PDR Agent**: Payment routing
- **CRRAK Agent**: Audit and compliance reporting
- **RCA Agent**: Root cause analysis

---

**🎯 The ACC Agent is the core compliance engine of the Arealis Gateway, ensuring all payment transactions meet regulatory requirements before processing.**