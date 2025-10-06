from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import datetime

app = FastAPI(title="RCA Agent Service", version="1.0")

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

# In-memory store for investigations (for demonstration purposes)
investigations_db = [
    {
        "investigation_id": "INV-001",
        "transaction_id": "TXN-12345",
        "status": "in_progress",
        "priority": "high",
        "assigned_to": "RCA Team",
        "created_at": "2025-01-06T10:00:00Z",
        "root_cause": "Payment routing failure",
        "failure_category": "Technical",
        "primary_cause": "Technical",
        "amount": "₹15,000",
        "next_step": "Retry",
        "trace_id": "TRC-2024-001236"
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
        "primary_cause": "Regulatory",
        "amount": "₹25,000",
        "next_step": "Completed",
        "trace_id": "TRC-2024-001231"
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
        "primary_cause": "Operational",
        "amount": "₹35,000",
        "next_step": "Investigate",
        "trace_id": "TRC-2024-001228"
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
        "primary_cause": "Risk-based",
        "amount": "₹100,000",
        "next_step": "Request info",
        "trace_id": "TRC-2024-001220"
    }
]

@app.get("/")
async def read_root():
    return {"message": "RCA Agent Service", "status": "running"}

@app.get("/rca/investigations")
async def get_investigations(api_key: str = Depends(verify_api_key)):
    """Get all active investigations"""
    return {
        "success": True,
        "data": {
            "active_investigations": investigations_db,
            "cause_categories": [
                {"category": "Technical", "count": 15, "percentage": 45.5},
                {"category": "Regulatory", "count": 8, "percentage": 24.2},
                {"category": "Operational", "count": 7, "percentage": 21.2},
                {"category": "Risk-based", "count": 3, "percentage": 9.1}
            ]
        }
    }

@app.post("/rca/retry-investigation/{investigation_id}")
async def retry_investigation(investigation_id: str, api_key: str = Depends(verify_api_key)):
    """Retry a failed investigation"""
    try:
        # Find the investigation
        investigation = next((inv for inv in investigations_db if inv["investigation_id"] == investigation_id), None)
        if not investigation:
            raise HTTPException(status_code=404, detail="Investigation not found")
        
        # Update status to retrying
        investigation["status"] = "retrying"
        investigation["next_step"] = "Retrying..."
        investigation["updated_at"] = datetime.datetime.now().isoformat()
        
        return {
            "success": True,
            "message": f"Investigation {investigation_id} retry initiated",
            "investigation_id": investigation_id,
            "status": "retrying"
        }
    except Exception as e:
        return {"success": False, "message": f"Error retrying investigation: {str(e)}"}

@app.post("/rca/cancel-investigation/{investigation_id}")
async def cancel_investigation(investigation_id: str, reason: str = "Investigation cancelled by user", api_key: str = Depends(verify_api_key)):
    """Cancel an investigation and initiate refund"""
    try:
        # Find the investigation
        investigation = next((inv for inv in investigations_db if inv["investigation_id"] == investigation_id), None)
        if not investigation:
            raise HTTPException(status_code=404, detail="Investigation not found")
        
        # Update status to cancelled
        investigation["status"] = "cancelled"
        investigation["next_step"] = "Refund initiated"
        investigation["cancellation_reason"] = reason
        investigation["updated_at"] = datetime.datetime.now().isoformat()
        
        return {
            "success": True,
            "message": f"Investigation {investigation_id} cancelled and refund initiated",
            "investigation_id": investigation_id,
            "status": "cancelled"
        }
    except Exception as e:
        return {"success": False, "message": f"Error cancelling investigation: {str(e)}"}

@app.get("/rca/decision-story/{investigation_id}")
async def get_decision_story(investigation_id: str, api_key: str = Depends(verify_api_key)):
    """Get detailed decision story for an investigation"""
    try:
        # Find the investigation
        investigation = next((inv for inv in investigations_db if inv["investigation_id"] == investigation_id), None)
        if not investigation:
            raise HTTPException(status_code=404, detail="Investigation not found")
        
        # Generate detailed decision story
        decision_story = {
            "investigation_id": investigation_id,
            "transaction_id": investigation["transaction_id"],
            "trace_id": investigation["trace_id"],
            "decision_timeline": [
                {
                    "timestamp": investigation["created_at"],
                    "action": "Investigation initiated",
                    "details": f"Transaction {investigation['transaction_id']} flagged for investigation due to {investigation['root_cause']}"
                },
                {
                    "timestamp": datetime.datetime.now().isoformat(),
                    "action": "Current status",
                    "details": f"Investigation status: {investigation['status']}, Next step: {investigation['next_step']}"
                }
            ],
            "root_cause_analysis": {
                "primary_cause": investigation["primary_cause"],
                "failure_category": investigation["failure_category"],
                "root_cause": investigation["root_cause"],
                "impact_assessment": "Medium impact on transaction processing",
                "recommended_actions": [
                    "Review transaction parameters",
                    "Verify compliance requirements",
                    "Check system connectivity"
                ]
            },
            "audit_trail": [
                {
                    "action": "Investigation created",
                    "user": "System",
                    "timestamp": investigation["created_at"]
                },
                {
                    "action": "Status updated",
                    "user": "RCA Team",
                    "timestamp": datetime.datetime.now().isoformat()
                }
            ]
        }
        
        return {
            "success": True,
            "data": decision_story
        }
    except Exception as e:
        return {"success": False, "message": f"Error retrieving decision story: {str(e)}"}

@app.get("/rca/download-audit-pack/{investigation_id}")
async def download_audit_pack(investigation_id: str, api_key: str = Depends(verify_api_key)):
    """Download audit pack for an investigation"""
    try:
        # Find the investigation
        investigation = next((inv for inv in investigations_db if inv["investigation_id"] == investigation_id), None)
        if not investigation:
            raise HTTPException(status_code=404, detail="Investigation not found")
        
        # Generate audit pack content
        audit_pack_content = f"""
INVESTIGATION AUDIT PACK
========================

Investigation ID: {investigation_id}
Transaction ID: {investigation['transaction_id']}
Trace ID: {investigation['trace_id']}
Amount: {investigation['amount']}
Status: {investigation['status']}
Priority: {investigation['priority']}
Assigned To: {investigation['assigned_to']}
Created At: {investigation['created_at']}

ROOT CAUSE ANALYSIS:
-------------------
Primary Cause: {investigation['primary_cause']}
Failure Category: {investigation['failure_category']}
Root Cause: {investigation['root_cause']}
Next Step: {investigation['next_step']}

AUDIT TRAIL:
-----------
- Investigation initiated: {investigation['created_at']}
- Current status: {investigation['status']}
- Last updated: {datetime.datetime.now().isoformat()}

COMPLIANCE NOTES:
----------------
This investigation was conducted in accordance with regulatory requirements.
All actions have been logged and are subject to audit review.

Generated by: RCA Agent Service
Generated at: {datetime.datetime.now().isoformat()}
        """
        
        return {
            "success": True,
            "data": {
                "investigation_id": investigation_id,
                "audit_pack_content": audit_pack_content,
                "download_url": f"/rca/download-audit-pack/{investigation_id}",
                "generated_at": datetime.datetime.now().isoformat()
            }
        }
    except Exception as e:
        return {"success": False, "message": f"Error generating audit pack: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
