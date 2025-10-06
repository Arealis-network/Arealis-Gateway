from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import requests
import json
from datetime import datetime, timedelta

app = FastAPI(title="ARL Agent Service", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

@app.get("/")
async def read_root():
    return {"message": "ARL Agent Service", "status": "running"}

@app.get("/arl/overview-metrics")
async def get_overview_metrics():
    try:
        # Fetch real data from ACC service
        acc_response = requests.get("http://localhost:8000/acc/vendor-payments", 
                                  headers={"X-API-Key": "arealis_api_key_2024"})
        
        if acc_response.status_code == 200:
            acc_data = acc_response.json()
            kpis = acc_data.get("data", {}).get("kpis", {})
            
            # Calculate real metrics from ACC data
            total_paid = kpis.get("total_paid", 0)
            vendors_count = kpis.get("vendors_count", 0)
            pending_approvals = kpis.get("pending_approvals", 0)
            
            # Calculate success rate based on pending approvals
            total_transactions = vendors_count + pending_approvals
            success_rate = (vendors_count / total_transactions * 100) if total_transactions > 0 else 98.7
            
            return {
                "success": True,
                "data": {
                    "todays_volume": {
                        "value": total_transactions,
                        "change_percent": 18.2,
                        "trend": "up"
                    },
                    "success_rate": {
                        "value": round(success_rate, 1),
                        "change_percent": 2.1,
                        "trend": "up"
                    },
                    "avg_time_to_settle": {
                        "value": 2.3,
                        "change_percent": -5.2,
                        "trend": "down"
                    },
                    "approvals_pending": {
                        "value": pending_approvals,
                        "change_percent": 12.5,
                        "trend": "up"
                    }
                }
            }
        else:
            # Fallback to static data if ACC service is unavailable
            return {
                "success": True,
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
    except Exception as e:
        print(f"Error fetching real data: {e}")
        # Fallback to static data
        return {
            "success": True,
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

@app.get("/arl/ledger-recon")
async def get_ledger_recon():
    # Placeholder for ledger and reconciliation data
    return {
        "success": True,
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
                },
                {
                    "entry_id": "JE-002", 
                    "date": "2025-01-06",
                    "description": "Bank Transfer - XYZ Ltd",
                    "debit": 0.00,
                    "credit": 75000.00,
                    "status": "pending"
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003)
