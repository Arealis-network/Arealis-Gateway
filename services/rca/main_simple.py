from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="RCA Agent Service", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

@app.get("/")
async def read_root():
    return {"message": "RCA Agent Service", "status": "running"}

@app.get("/rca/investigations")
async def get_investigations():
    # Placeholder for investigation data
    return {
        "success": True,
        "data": {
            "active_investigations": [
                {
                    "investigation_id": "INV-001",
                    "transaction_id": "TXN-12345",
                    "status": "in_progress",
                    "priority": "high",
                    "assigned_to": "RCA Team",
                    "created_at": "2025-01-06T10:00:00Z",
                    "root_cause": "Payment routing failure",
                    "failure_category": "Technical",
                    "primary_cause": "Technical"
                },
                {
                    "investigation_id": "INV-002", 
                    "transaction_id": "TXN-12346",
                    "status": "completed",
                    "priority": "medium",
                    "assigned_to": "RCA Team",
                    "created_at": "2025-01-06T09:30:00Z",
                    "root_cause": "Compliance check failure",
                    "failure_category": "Regulatory",
                    "primary_cause": "Regulatory"
                },
                {
                    "investigation_id": "INV-003",
                    "transaction_id": "TXN-12347",
                    "status": "pending",
                    "priority": "low",
                    "assigned_to": "RCA Team",
                    "created_at": "2025-01-06T11:00:00Z",
                    "root_cause": "System timeout during processing",
                    "failure_category": "Operational",
                    "primary_cause": "Operational"
                },
                {
                    "investigation_id": "INV-004",
                    "transaction_id": "TXN-12348",
                    "status": "in_progress",
                    "priority": "high",
                    "assigned_to": "RCA Team",
                    "created_at": "2025-01-06T11:30:00Z",
                    "root_cause": "High risk transaction flagged",
                    "failure_category": "Risk-based",
                    "primary_cause": "Risk-based"
                }
            ],
            "cause_categories": [
                {"category": "Technical", "count": 15, "percentage": 45.5},
                {"category": "Regulatory", "count": 8, "percentage": 24.2},
                {"category": "Operational", "count": 7, "percentage": 21.2},
                {"category": "Risk-based", "count": 3, "percentage": 9.1}
            ]
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
