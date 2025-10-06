from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
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

# API Key configuration
API_KEY = "arealis_api_key_2024"

def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    return x_api_key

# In-memory store for ledger data (for demonstration purposes)
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
        "createdAt": "2025-10-02 10:21:10",
    },
    {
        "id": "JRN-10002",
        "trace": "TRC-2024-001211",
        "stage": "CLEARING",
        "rail": "NEFT",
        "account": "Ops-01",
        "merchant": "Volt Inc",
        "amount": "₹55,000",
        "status": "posted",
        "createdAt": "2025-10-02 10:19:07",
    },
    {
        "id": "JRN-10003",
        "trace": "TRC-2024-001212",
        "stage": "SETTLEMENT",
        "rail": "RTGS",
        "account": "Ops-02",
        "merchant": "Globex",
        "amount": "₹1,20,000",
        "status": "posted",
        "createdAt": "2025-10-02 10:15:30",
    }
]

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

@app.post("/arl/download-journal-csv/{journal_id}")
async def download_journal_csv(journal_id: str, api_key: str = Depends(verify_api_key)):
    """Download journal CSV for a specific journal entry"""
    try:
        # Find the journal entry
        journal = next((j for j in ledger_db if j["id"] == journal_id), None)
        if not journal:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        
        # Generate CSV content
        csv_content = f"""Journal ID,Trace ID,Stage,Rail,Account,Merchant,Amount,Status,Created At
{journal['id']},{journal['trace']},{journal['stage']},{journal['rail']},{journal['account']},{journal['merchant']},{journal['amount']},{journal['status']},{journal['createdAt']}"""
        
        return {
            "success": True,
            "data": {
                "journal_id": journal_id,
                "csv_content": csv_content,
                "filename": f"journal_{journal_id}.csv",
                "generated_at": datetime.now().isoformat()
            }
        }
    except Exception as e:
        return {"success": False, "message": f"Error generating journal CSV: {str(e)}"}

@app.post("/arl/rerun-matching")
async def rerun_matching(api_key: str = Depends(verify_api_key)):
    """Re-run matching for all unmatched entries"""
    try:
        # Simulate re-running matching
        matched_count = 3
        unmatched_count = 1
        
        return {
            "success": True,
            "message": f"Matching completed. {matched_count} entries matched, {unmatched_count} still unmatched",
            "data": {
                "matched_count": matched_count,
                "unmatched_count": unmatched_count,
                "executed_at": datetime.now().isoformat()
            }
        }
    except Exception as e:
        return {"success": False, "message": f"Error re-running matching: {str(e)}"}

@app.post("/arl/match-entry/{entry_id}")
async def match_entry(entry_id: str, api_key: str = Depends(verify_api_key)):
    """Match a specific unmatched entry"""
    try:
        # Simulate matching an entry
        return {
            "success": True,
            "message": f"Entry {entry_id} matched successfully",
            "data": {
                "entry_id": entry_id,
                "matched_at": datetime.now().isoformat(),
                "status": "matched"
            }
        }
    except Exception as e:
        return {"success": False, "message": f"Error matching entry: {str(e)}"}

@app.post("/arl/attach-document/{entry_id}")
async def attach_document(entry_id: str, api_key: str = Depends(verify_api_key)):
    """Attach a document to an entry"""
    try:
        return {
            "success": True,
            "message": f"Document attached to entry {entry_id}",
            "data": {
                "entry_id": entry_id,
                "document_attached_at": datetime.now().isoformat(),
                "status": "document_attached"
            }
        }
    except Exception as e:
        return {"success": False, "message": f"Error attaching document: {str(e)}"}

@app.post("/arl/rematch-entry/{entry_id}")
async def rematch_entry(entry_id: str, api_key: str = Depends(verify_api_key)):
    """Re-match a specific entry"""
    try:
        return {
            "success": True,
            "message": f"Entry {entry_id} re-matched successfully",
            "data": {
                "entry_id": entry_id,
                "rematched_at": datetime.now().isoformat(),
                "status": "rematched"
            }
        }
    except Exception as e:
        return {"success": False, "message": f"Error re-matching entry: {str(e)}"}

@app.post("/arl/raise-dispute/{entry_id}")
async def raise_dispute(entry_id: str, reason: str = "Dispute raised by user", api_key: str = Depends(verify_api_key)):
    """Raise a dispute for an entry"""
    try:
        return {
            "success": True,
            "message": f"Dispute raised for entry {entry_id}",
            "data": {
                "entry_id": entry_id,
                "dispute_reason": reason,
                "dispute_raised_at": datetime.now().isoformat(),
                "status": "dispute_raised"
            }
        }
    except Exception as e:
        return {"success": False, "message": f"Error raising dispute: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003)
