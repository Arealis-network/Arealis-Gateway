# 📋 CRRAK Agent (Compliance & Regulatory Reporting)

## 📋 Overview

The CRRAK Agent provides explainable AI and audit capabilities for the Arealis Gateway. It handles compliance reporting, regulatory filings, and audit trail management for all payment transactions.

## 🏗️ Architecture

- **Framework**: FastAPI
- **Data Source**: Static data + integration capabilities
- **Port**: 8000
- **Workers**: 4 Gunicorn workers

## 🔧 Features

### Compliance Reporting
- **Regulatory Filings**: Generate compliance reports
- **Audit Trails**: Track all compliance decisions
- **Evidence Collection**: Collect and store compliance evidence
- **Report Generation**: Create detailed compliance reports

### Explainable AI
- **Decision Explanations**: Explain AI decisions
- **Policy Reasoning**: Show policy evaluation logic
- **Evidence Mapping**: Map evidence to decisions
- **Audit Logs**: Comprehensive audit logging

### Audit Management
- **Audit Queries**: Query audit data
- **Compliance Checks**: Perform compliance validations
- **Report Export**: Export audit reports
- **Evidence Retrieval**: Retrieve compliance evidence

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
docker build -t arealis-crrak-agent:latest .

# Run container
docker run -d \
    --name crrak-agent \
    -p 8000:8000 \
    arealis-crrak-agent:latest
```

## 📡 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service status and information |
| GET | `/health` | Service health status |

### Compliance Reporting

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/crrak/compliance-reports` | Get compliance reports |
| POST | `/crrak/generate-report` | Generate compliance report |
| GET | `/crrak/audit-trail` | Get audit trail data |
| POST | `/crrak/export-audit` | Export audit data |

### Evidence Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/crrak/evidence/{transaction_id}` | Get evidence for transaction |
| POST | `/crrak/collect-evidence` | Collect compliance evidence |
| GET | `/crrak/evidence-summary` | Get evidence summary |

### Policy Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/crrak/policy-analysis` | Analyze policy decisions |
| POST | `/crrak/explain-decision` | Explain AI decision |
| GET | `/crrak/policy-metrics` | Get policy performance metrics |

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

### Get Compliance Reports

```bash
curl -X GET "http://localhost:8000/crrak/compliance-reports" \
  -H "X-API-Key: arealis_api_key_2024"
```

Response:
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "report_id": "CR-2025-001",
        "report_type": "Monthly Compliance",
        "period": "2025-01",
        "status": "completed",
        "generated_at": "2025-01-06T10:30:00Z",
        "total_transactions": 1250,
        "compliance_rate": 98.4,
        "violations": 20
      }
    ],
    "summary": {
      "total_reports": 12,
      "pending_reports": 1,
      "compliance_rate_avg": 97.8
    }
  }
}
```

### Generate Compliance Report

```bash
curl -X POST "http://localhost:8000/crrak/generate-report" \
  -H "X-API-Key: arealis_api_key_2024" \
  -H "Content-Type: application/json" \
  -d '{
    "report_type": "Monthly Compliance",
    "period": "2025-01",
    "include_evidence": true
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "report_id": "CR-2025-002",
    "status": "generating",
    "estimated_completion": "2025-01-06T10:35:00Z",
    "message": "Report generation initiated"
  }
}
```

### Get Audit Trail

```bash
curl -X GET "http://localhost:8000/crrak/audit-trail?limit=10&offset=0" \
  -H "X-API-Key: arealis_api_key_2024"
```

Response:
```json
{
  "success": true,
  "data": {
    "audit_entries": [
      {
        "entry_id": "AE-001",
        "transaction_id": "TXN-12345",
        "action": "compliance_check",
        "decision": "PASS",
        "policy_version": "acc-1.4.2",
        "evidence_count": 3,
        "timestamp": "2025-01-06T10:30:00Z",
        "user_id": "system"
      }
    ],
    "pagination": {
      "total": 1250,
      "limit": 10,
      "offset": 0,
      "has_more": true
    }
  }
}
```

### Get Evidence for Transaction

```bash
curl -X GET "http://localhost:8000/crrak/evidence/TXN-12345" \
  -H "X-API-Key: arealis_api_key_2024"
```

Response:
```json
{
  "success": true,
  "data": {
    "transaction_id": "TXN-12345",
    "evidence": [
      {
        "evidence_id": "EV-001",
        "type": "pan_verification",
        "status": "success",
        "details": {
          "pan_number": "ABCDE1234A",
          "verification_result": "valid",
          "aadhaar_seeding_status": "LINKED"
        },
        "timestamp": "2025-01-06T10:30:00Z"
      },
      {
        "evidence_id": "EV-002",
        "type": "bank_verification",
        "status": "success",
        "details": {
          "account_number": "1234567890",
          "ifsc_code": "HDFC0001234",
          "verification_result": "VALID",
          "name_match_score": "90.00"
        },
        "timestamp": "2025-01-06T10:30:01Z"
      }
    ],
    "total_evidence": 2
  }
}
```

### Explain AI Decision

```bash
curl -X POST "http://localhost:8000/crrak/explain-decision" \
  -H "X-API-Key: arealis_api_key_2024" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "TXN-12345",
    "decision": "PASS"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "transaction_id": "TXN-12345",
    "decision": "PASS",
    "explanation": {
      "policy_evaluation": {
        "policy_version": "acc-1.4.2",
        "rules_evaluated": 5,
        "rules_passed": 5,
        "rules_failed": 0
      },
      "evidence_analysis": {
        "pan_verification": "PASS - Valid PAN with linked Aadhaar",
        "bank_verification": "PASS - Account valid with good name match",
        "gstin_verification": "PASS - Valid GSTIN for vendor payment"
      },
      "risk_assessment": {
        "risk_score": 0.15,
        "risk_level": "LOW",
        "factors": [
          "Valid KYC documents",
          "Good bank verification score",
          "No previous violations"
        ]
      }
    },
    "confidence_score": 0.95
  }
}
```

### Get Policy Metrics

```bash
curl -X GET "http://localhost:8000/crrak/policy-metrics" \
  -H "X-API-Key: arealis_api_key_2024"
```

Response:
```json
{
  "success": true,
  "data": {
    "policy_performance": {
      "total_evaluations": 1250,
      "pass_rate": 98.4,
      "fail_rate": 1.6,
      "average_processing_time": "0.8s"
    },
    "rule_performance": [
      {
        "rule_name": "pan_verification",
        "evaluations": 1250,
        "pass_rate": 99.2,
        "fail_rate": 0.8
      },
      {
        "rule_name": "bank_verification",
        "evaluations": 1250,
        "pass_rate": 97.8,
        "fail_rate": 2.2
      }
    ],
    "violation_analysis": {
      "common_violations": [
        {
          "violation_type": "invalid_ifsc",
          "count": 15,
          "percentage": 1.2
        },
        {
          "violation_type": "missing_pan",
          "count": 5,
          "percentage": 0.4
        }
      ]
    }
  }
}
```

## 🗄️ Data Structure

### Compliance Report

```json
{
  "report_id": "CR-2025-001",
  "report_type": "Monthly Compliance",
  "period": "2025-01",
  "status": "completed",
  "generated_at": "2025-01-06T10:30:00Z",
  "total_transactions": 1250,
  "compliance_rate": 98.4,
  "violations": 20
}
```

### Audit Entry

```json
{
  "entry_id": "AE-001",
  "transaction_id": "TXN-12345",
  "action": "compliance_check",
  "decision": "PASS",
  "policy_version": "acc-1.4.2",
  "evidence_count": 3,
  "timestamp": "2025-01-06T10:30:00Z",
  "user_id": "system"
}
```

### Evidence

```json
{
  "evidence_id": "EV-001",
  "type": "pan_verification",
  "status": "success",
  "details": {
    "pan_number": "ABCDE1234A",
    "verification_result": "valid",
    "aadhaar_seeding_status": "LINKED"
  },
  "timestamp": "2025-01-06T10:30:00Z"
}
```

### Decision Explanation

```json
{
  "policy_evaluation": {
    "policy_version": "acc-1.4.2",
    "rules_evaluated": 5,
    "rules_passed": 5,
    "rules_failed": 0
  },
  "evidence_analysis": {
    "pan_verification": "PASS - Valid PAN with linked Aadhaar",
    "bank_verification": "PASS - Account valid with good name match"
  },
  "risk_assessment": {
    "risk_score": 0.15,
    "risk_level": "LOW"
  }
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
  "message": "Error generating report: Invalid parameters"
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
  "service": "crrak"
}
```

### Metrics

- Report generation time
- Audit query performance
- Evidence collection rate
- Policy evaluation metrics

## 🔄 Deployment

### Docker Build

```bash
docker build -t arealis-crrak-agent:latest .
```

### Docker Run

```bash
docker run -d \
    --name crrak-agent \
    -p 8000:8000 \
    arealis-crrak-agent:latest
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

# Test compliance reports
curl -X GET "http://localhost:8000/crrak/compliance-reports" \
  -H "X-API-Key: arealis_api_key_2024"

# Test audit trail
curl -X GET "http://localhost:8000/crrak/audit-trail" \
  -H "X-API-Key: arealis_api_key_2024"
```

## 📚 Documentation

- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Spec**: http://localhost:8000/openapi.json

## 🔗 Related Services

- **ACC Agent**: Source of compliance decisions
- **ARL Agent**: Reconciliation data
- **PDR Agent**: Routing information
- **RCA Agent**: Failure analysis

## 🎯 Key Features

### Compliance Reporting
- Automated report generation
- Regulatory compliance tracking
- Audit trail maintenance
- Evidence collection and storage

### Explainable AI
- Decision transparency
- Policy reasoning
- Evidence mapping
- Risk assessment explanations

### Audit Management
- Comprehensive audit logging
- Query and retrieval capabilities
- Export functionality
- Historical data access

### Performance Monitoring
- Policy performance metrics
- Violation analysis
- Processing time tracking
- Compliance rate monitoring

---

**📋 The CRRAK Agent provides comprehensive compliance reporting and explainable AI capabilities, ensuring transparency and auditability for all payment processing decisions in the Arealis Gateway.**
