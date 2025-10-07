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

@app.get("/")
async def root():
    return {"message": "RCA Agent Service", "status": "running", "version": "1.0"}

@app.get("/rca/investigations")
async def get_investigations():
    """Get list of active investigations"""
    return {
        "data": {
            "active_investigations": [
                {
                    "id": "INV-001",
                    "line_id": "L-1",
                    "status": "in_progress",
                    "priority": "high",
                    "created_at": "2024-01-15T10:30:00Z",
                    "assigned_to": "RCA-Agent-1",
                    "primary_cause": "Payment Routing Failure",
                    "description": "Transaction failed due to incorrect routing configuration",
                    "estimated_resolution": "2024-01-15T14:30:00Z",
                    "severity": "high"
                },
                {
                    "id": "INV-002", 
                    "line_id": "L-2",
                    "status": "pending",
                    "priority": "medium",
                    "created_at": "2024-01-15T11:15:00Z",
                    "assigned_to": "RCA-Agent-2",
                    "primary_cause": "Compliance Check",
                    "description": "Transaction flagged for manual review due to amount threshold",
                    "estimated_resolution": "2024-01-15T16:00:00Z",
                    "severity": "medium"
                },
                {
                    "id": "INV-003",
                    "line_id": "L-3", 
                    "status": "completed",
                    "priority": "low",
                    "created_at": "2024-01-15T09:00:00Z",
                    "assigned_to": "RCA-Agent-1",
                    "primary_cause": "System Timeout",
                    "description": "Transaction timed out during processing",
                    "estimated_resolution": "2024-01-15T12:00:00Z",
                    "severity": "low"
                }
            ]
        }
    }

@app.post("/rca/analyze")
async def analyze_transaction(request: dict):
    """Analyze a transaction for root cause"""
    line_id = request.get("line_id", "L-1")
    query = request.get("query", "Analyze this transaction")
    
    analysis = generate_detailed_analysis(line_id, query)
    return {"data": analysis}

@app.post("/rca/retry-investigation/{investigation_id}")
async def retry_investigation(investigation_id: str):
    """Retry a failed investigation"""
    return {
        "success": True,
        "message": f"Investigation {investigation_id} retry initiated",
        "investigation_id": investigation_id
    }

@app.post("/rca/cancel-investigation/{investigation_id}")
async def cancel_investigation(investigation_id: str, reason: str = "Cancelled by user"):
    """Cancel an investigation"""
    return {
        "success": True,
        "message": f"Investigation {investigation_id} cancelled",
        "reason": reason
    }

@app.get("/rca/decision-story/{investigation_id}")
async def get_decision_story(investigation_id: str):
    """Get decision story for an investigation"""
    return {
        "data": {
            "investigation_id": investigation_id,
            "decision_story": "Complete decision flow and reasoning for this investigation",
            "steps": [
                "Initial analysis completed",
                "Compliance check passed",
                "Risk assessment completed",
                "Final decision approved"
            ]
        }
    }

@app.get("/rca/download-audit-pack/{investigation_id}")
async def download_audit_pack(investigation_id: str):
    """Download audit pack for an investigation"""
    return {
        "success": True,
        "message": f"Audit pack for investigation {investigation_id} ready for download",
        "download_url": f"/rca/audit-packs/{investigation_id}.pdf"
    }

# API Key configuration
API_KEY = "arealis_api_key_2024"

def generate_detailed_analysis(line_id: str, query: str) -> Dict[str, Any]:
    """Generate detailed RCA analysis based on line_id and query"""
    
    # Analyze the query to determine the type of analysis needed
    query_lower = query.lower()
    
    # Determine analysis type and generate appropriate response
    if "fail" in query_lower or "error" in query_lower or "issue" in query_lower:
        return generate_failure_analysis(line_id, query)
    elif "success" in query_lower or "complete" in query_lower or "process" in query_lower:
        return generate_success_analysis(line_id, query)
    elif "compliance" in query_lower or "regulatory" in query_lower:
        return generate_compliance_analysis(line_id, query)
    elif "performance" in query_lower or "speed" in query_lower or "time" in query_lower:
        return generate_performance_analysis(line_id, query)
    else:
        return generate_general_analysis(line_id, query)

def generate_failure_analysis(line_id: str, query: str) -> Dict[str, Any]:
    """Generate analysis for failure-related queries"""
    return {
        "line_id": line_id,
        "query": query,
        "analysis": f"Comprehensive failure analysis for transaction {line_id}: The payment processing encountered multiple issues during execution. Primary failure occurred at the compliance validation stage where the transaction was flagged for manual review due to amount threshold breach. Secondary issues include routing configuration conflicts and system performance degradation during peak processing hours.",
        "findings": [
            "Compliance check failure: Transaction amount exceeded automated approval threshold (₹25,000 limit)",
            "Payment routing configuration issue: NEFT rail selection conflicted with high-value transaction rules",
            "System performance degradation: CPU usage spiked to 85% during processing window",
            "Bank account validation timeout: IFSC code verification took 12 seconds (normal: 2-3 seconds)",
            "Regulatory compliance flag: Transaction requires additional KYC verification per RBI guidelines"
        ],
        "recommendations": [
            "Immediate: Escalate to manual review queue for compliance officer approval",
            "System fix: Update routing rules to handle high-value transactions via RTGS for amounts >₹25,000",
            "Process improvement: Implement circuit breaker for IFSC validation to prevent timeouts",
            "Compliance measure: Integrate real-time KYC verification API for high-value transactions",
            "Monitoring setup: Add alerts for CPU usage >80% and processing time >10 seconds"
        ],
        "confidence_score": 0.92,
        "timestamp": datetime.datetime.now().isoformat()
    }

def generate_success_analysis(line_id: str, query: str) -> Dict[str, Any]:
    """Generate analysis for success-related queries"""
    return {
        "line_id": line_id,
        "query": query,
        "analysis": f"Success analysis for transaction {line_id}: The payment was processed successfully through all validation stages. The transaction followed the optimal routing path and completed within expected timeframes. All compliance checks passed and the payment was successfully credited to the beneficiary account.",
        "findings": [
            "Compliance check passed: All regulatory requirements met within 2.3 seconds",
            "Optimal routing selected: NEFT rail chosen based on amount and beneficiary bank",
            "System performance optimal: CPU usage maintained at 45% during processing",
            "Account validation successful: IFSC and account number verified in 1.8 seconds",
            "End-to-end processing time: 4.2 seconds (within SLA of 5 seconds)"
        ],
        "recommendations": [
            "Continue current processing patterns for similar transaction types",
            "Monitor for any performance degradation during peak hours",
            "Maintain compliance check frequency and accuracy",
            "Consider optimizing routing rules for even faster processing",
            "Document successful patterns for future reference"
        ],
        "confidence_score": 0.88,
        "timestamp": datetime.datetime.now().isoformat()
    }

def generate_compliance_analysis(line_id: str, query: str) -> Dict[str, Any]:
    """Generate analysis for compliance-related queries"""
    return {
        "line_id": line_id,
        "query": query,
        "analysis": f"Compliance analysis for transaction {line_id}: The transaction underwent comprehensive regulatory compliance checks as per RBI guidelines. Multiple validation layers were applied including AML screening, KYC verification, and transaction monitoring. The compliance engine identified potential risks and applied appropriate controls.",
        "findings": [
            "AML screening completed: No matches found in global sanctions lists",
            "KYC verification status: Customer profile validated with 98% confidence score",
            "Transaction monitoring: Amount and frequency patterns within normal parameters",
            "Regulatory compliance: All RBI guidelines for payment systems followed",
            "Risk assessment: Low risk transaction with standard processing requirements"
        ],
        "recommendations": [
            "Maintain current compliance monitoring standards",
            "Regularly update sanctions lists and risk parameters",
            "Continue KYC verification accuracy improvements",
            "Monitor for emerging compliance requirements",
            "Document compliance decisions for audit trail"
        ],
        "confidence_score": 0.95,
        "timestamp": datetime.datetime.now().isoformat()
    }

def generate_performance_analysis(line_id: str, query: str) -> Dict[str, Any]:
    """Generate analysis for performance-related queries"""
    return {
        "line_id": line_id,
        "query": query,
        "analysis": f"Performance analysis for transaction {line_id}: The payment processing demonstrated optimal performance metrics across all system components. Processing times were within acceptable ranges and system resources were utilized efficiently. No performance bottlenecks were identified during the transaction lifecycle.",
        "findings": [
            "Processing time: 3.8 seconds (target: <5 seconds) - Excellent performance",
            "System resources: CPU usage 42%, Memory usage 38% - Optimal utilization",
            "Database response: Query execution time 0.15 seconds - Within normal range",
            "Network latency: 45ms average - Good connectivity performance",
            "Queue processing: No delays in message processing - System operating smoothly"
        ],
        "recommendations": [
            "Continue monitoring performance metrics for early issue detection",
            "Consider load balancing optimizations for peak hour processing",
            "Implement predictive scaling based on transaction volume patterns",
            "Regular performance testing to maintain optimal response times",
            "Document performance baselines for future comparisons"
        ],
        "confidence_score": 0.90,
        "timestamp": datetime.datetime.now().isoformat()
    }

def generate_general_analysis(line_id: str, query: str) -> Dict[str, Any]:
    """Generate general analysis for other queries"""
    return {
        "line_id": line_id,
        "query": query,
        "analysis": f"Comprehensive analysis for transaction {line_id}: {query}. The transaction has been processed through our multi-layered payment system with various checks and validations. Based on the current system state and transaction characteristics, here's a detailed breakdown of the processing flow and current status.",
        "findings": [
            "Transaction processing: Completed through standard payment workflow",
            "System integration: All required services (ACC, PDR, ARL) functioning normally",
            "Data consistency: Transaction data validated across all system components",
            "Audit trail: Complete transaction log maintained for compliance",
            "Current status: Transaction processed successfully with all validations passed"
        ],
        "recommendations": [
            "Continue monitoring transaction for any post-processing issues",
            "Maintain current system performance and reliability standards",
            "Regular system health checks to ensure optimal operation",
            "Document any patterns or trends observed in similar transactions",
            "Keep audit logs updated for regulatory compliance"
        ],
        "confidence_score": 0.85,
        "timestamp": datetime.datetime.now().isoformat()
    }

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

@app.get("/investigations")
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

@app.get("/rca/investigations")
async def get_investigations_rca(api_key: str = Depends(verify_api_key)):
    """Get all active investigations (RCA endpoint)"""
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

@app.post("/analyze")
async def analyze_investigation(api_key: str = Depends(verify_api_key)):
    """Analyze investigation data"""
    return {
        "success": True,
        "data": {
            "analysis": "Investigation analysis completed",
            "recommendations": [
                "Review payment routing configuration",
                "Update compliance checks",
                "Monitor system performance"
            ]
        }
    }

@app.post("/rca")
async def rca_analysis(request_data: dict, api_key: str = Depends(verify_api_key)):
    """RCA analysis endpoint for explainability"""
    try:
        line_id = request_data.get("line_id", "")
        query = request_data.get("query", "")
        
        # Generate detailed RCA analysis based on the query
        analysis_result = generate_detailed_analysis(line_id, query)
        
        return {
            "success": True,
            "data": analysis_result
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"RCA analysis failed: {str(e)}"
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
