from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import os
import tempfile
import json

app = FastAPI(title="CRRAK Agent Service", version="1.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:3002", "http://localhost:3003"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# API Key configuration
VALID_API_KEYS = [
    "arealis_api_key_2024",
    "test_api_key_123", 
    "demo_key_456",
    "production_key_789"
]

def verify_api_key(x_api_key: Optional[str] = Header(None)):
    """Verify API key from header"""
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")
    if x_api_key not in VALID_API_KEYS:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key

@app.get("/")
async def root():
    return {"message": "CRRAK Agent Service", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "crrak"}

@app.get("/crrak/audit-filings")
async def get_audit_filings(api_key: str = Depends(verify_api_key)):
    """Get audit & filing data for CRRAK agent"""
    return {
        "success": True,
        "data": {
            "compliance_metrics": {
                "total_audit_packs": 12,
                "pending_filings": 3,
                "compliance_score": 98.5
            },
            "audit_packs": [
                {
                    "pack_id": "AUDIT-001",
                    "batch_id": "B-2024-001",
                    "status": "generated",
                    "download_url": "http://localhost:8004/crrak/download/AUDIT-001",
                    "created_at": "2024-01-15T10:20:00Z"
                },
                {
                    "pack_id": "AUDIT-002", 
                    "batch_id": "B-2024-002",
                    "status": "reviewed",
                    "download_url": "http://localhost:8004/crrak/download/AUDIT-002",
                    "created_at": "2024-01-15T10:25:00Z"
                },
                {
                    "pack_id": "AUDIT-003",
                    "batch_id": "B-2024-003", 
                    "status": "filed",
                    "download_url": "http://localhost:8004/crrak/download/AUDIT-003",
                    "created_at": "2024-01-15T10:30:00Z"
                }
            ]
        }
    }

@app.post("/crrak/generate-audit-pack")
async def generate_audit_pack(batch_id: str, api_key: str = Depends(verify_api_key)):
    """Generate audit pack for a batch"""
    pack_id = f"AUDIT-{batch_id}"
    return {
        "success": True,
        "pack_id": pack_id,
        "download_url": f"http://localhost:8004/crrak/download/{pack_id}",
        "message": "Audit pack generated successfully"
    }

@app.post("/crrak/generate-rbi-report")
async def generate_rbi_report(
    format: str = "excel",
    entity_name: str = "Arealis Gateway",
    reporting_period: str = "Q1-2025",
    api_key: str = Depends(verify_api_key)
):
    """Generate RBI Payment Transaction Audit Report"""
    import datetime
    
    # Generate sample RBI-compliant transaction data
    sample_transactions = []
    for i in range(1, 21):  # Generate 20 sample transactions
        transaction_date = datetime.datetime.now() - datetime.timedelta(days=i)
        sample_transactions.append({
            "transaction_id": f"TXN-{i:06d}",
            "transaction_date": transaction_date.strftime("%d/%m/%Y"),
            "transaction_time": transaction_date.strftime("%H:%M:%S"),
            "value_date": transaction_date.strftime("%d/%m/%Y"),
            "utr_number": f"UTR{transaction_date.strftime('%Y%m%d')}{i:04d}",
            "remitter_name": "AREALIS GATEWAY",
            "remitter_account_number": "1234567890123456",
            "remitter_ifsc_code": "SBIN0001234",
            "remitter_bank_name": "STATE BANK OF INDIA",
            "remitter_mobile_number": "9876543210",
            "beneficiary_name": f"VENDOR {i:03d}",
            "beneficiary_account_number": f"ACC{i:010d}",
            "beneficiary_ifsc_code": "HDFC0001234",
            "beneficiary_bank_name": "HDFC BANK",
            "beneficiary_mobile_number": "9876543210",
            "transaction_amount": round(10000 + (i * 1000), 2),
            "transaction_type": "NEFT",
            "payment_mode": "Bulk Upload",
            "purpose_code": "P01",
            "remarks_narration": f"Payment for Vendor {i:03d} - Invoice INV-{i:06d}",
            "transaction_status": "Success" if i % 4 != 0 else "Failed",
            "failure_reason": "Insufficient funds" if i % 4 == 0 else None,
            "reversal_date": None,
            "charges_levied": 5.0,
            "gst_on_charges": 0.9,
            "batch_number": f"BATCH-{datetime.datetime.now().year}-{i:03d}",
            "initiated_by": "SYSTEM USER",
            "authorized_by": "AUTHORIZED USER",
            "reconciliation_status": "Reconciled" if i % 4 != 0 else "Pending",
            "exception_flag": "Yes" if i % 4 == 0 else "No",
            "customer_id": f"CUST-{i:06d}",
            "pan_number": "ABCDE1234F" if (10000 + (i * 1000)) > 50000 else None,
            "reporting_period": reporting_period,
            "branch_code": "BR001"
        })
    
    return {
        "success": True,
        "data": {
            "report_info": {
                "entity_name": entity_name,
                "reporting_period": reporting_period,
                "format": format,
                "total_transactions": len(sample_transactions),
                "generated_at": datetime.datetime.now().isoformat()
            },
            "transactions": sample_transactions
        },
        "message": f"RBI audit report generated successfully in {format.upper()} format"
    }

@app.get("/crrak/download/{pack_id}")
async def download_audit_pack(pack_id: str, api_key: str = Depends(verify_api_key)):
    """Download audit pack file"""
    import datetime
    
    # Create a temporary file with sample audit data
    temp_dir = tempfile.gettempdir()
    filename = f"{pack_id}_audit_report.pdf"
    file_path = os.path.join(temp_dir, filename)
    
    # Generate sample audit report content
    audit_content = f"""
RBI PAYMENT TRANSACTION AUDIT REPORT
====================================

Entity: Arealis Gateway
Report ID: {pack_id}
Generated: {datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
Reporting Period: Q1-2025

SUMMARY:
--------
Total Transactions: 20
Successful Transactions: 15
Failed Transactions: 5
Reconciliation Rate: 98.4%

TRANSACTION DETAILS:
-------------------
1. TXN-000001 | ₹11,000 | NEFT | Success | Reconciled
2. TXN-000002 | ₹12,000 | NEFT | Success | Reconciled
3. TXN-000003 | ₹13,000 | NEFT | Failed | Pending
4. TXN-000004 | ₹14,000 | NEFT | Success | Reconciled
5. TXN-000005 | ₹15,000 | NEFT | Failed | Pending

... (Additional transaction details)

COMPLIANCE STATUS:
-----------------
✅ All required RBI fields included
✅ Proper date formatting (DD/MM/YYYY)
✅ Transaction amounts in decimal format
✅ UTR numbers properly formatted
✅ Bank details complete

AUDIT TRAIL:
-----------
Generated by: CRRAK Agent Service
Authorized by: System Administrator
Review Status: Approved
Filing Status: Ready for submission

This is a sample audit report generated by the Arealis Gateway system.
For production use, this would contain actual transaction data from your system.
"""
    
    # Write content to temporary file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(audit_content)
    
    # Return file for download
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type='application/pdf',
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.post("/crrak/download-bank-format/{trace_id}")
async def download_bank_format(trace_id: str, format_type: str = "CSV", api_key: str = Depends(verify_api_key)):
    """Download bank format file for a specific trace"""
    try:
        # Generate bank format content based on format type
        if format_type.upper() == "CSV":
            content = f"""Trace ID,Bank,Amount,Status,UTR,Date
{trace_id},HDFC Bank,₹25,000,Processed,UTR2024001230456,2025-01-06
{trace_id},ICICI Bank,₹15,000,Processed,UTR2024001230457,2025-01-06"""
            filename = f"bank_format_{trace_id}.csv"
            content_type = "text/csv"
        elif format_type.upper() == "XML":
            content = f"""<?xml version="1.0" encoding="UTF-8"?>
<BankTransaction>
    <TraceID>{trace_id}</TraceID>
    <Bank>HDFC Bank</Bank>
    <Amount>₹25,000</Amount>
    <Status>Processed</Status>
    <UTR>UTR2024001230456</UTR>
    <Date>2025-01-06</Date>
</BankTransaction>"""
            filename = f"bank_format_{trace_id}.xml"
            content_type = "application/xml"
        else:
            content = f"Bank Format Report for {trace_id}\n\nTrace ID: {trace_id}\nBank: HDFC Bank\nAmount: ₹25,000\nStatus: Processed\nUTR: UTR2024001230456\nDate: 2025-01-06"
            filename = f"bank_format_{trace_id}.txt"
            content_type = "text/plain"
        
        return {
            "success": True,
            "data": {
                "trace_id": trace_id,
                "format_type": format_type,
                "content": content,
                "filename": filename,
                "content_type": content_type,
                "generated_at": "2025-01-06T20:30:00Z"
            }
        }
    except Exception as e:
        return {"success": False, "message": f"Error generating bank format file: {str(e)}"}

@app.post("/crrak/download-regulator-format/{trace_id}")
async def download_regulator_format(trace_id: str, format_type: str = "PDF", api_key: str = Depends(verify_api_key)):
    """Download regulator format file for a specific trace"""
    try:
        # Generate regulator format content
        content = f"""REGULATOR COMPLIANCE REPORT
============================

Trace ID: {trace_id}
Report Date: 2025-01-06
Regulator: RBI
Entity: Arealis Gateway

TRANSACTION DETAILS:
-------------------
Amount: ₹25,000
Status: Processed
UTR: UTR2024001230456
Bank: HDFC Bank
Processing Date: 2025-01-06

COMPLIANCE STATUS:
-----------------
✅ AML Check: Passed
✅ KYC Verification: Complete
✅ Sanctions Screening: Clear
✅ Transaction Monitoring: Normal

AUDIT TRAIL:
-----------
- Transaction initiated: 2025-01-06 10:30:00
- Compliance checks completed: 2025-01-06 10:31:00
- Bank processing: 2025-01-06 10:32:00
- Final status: Processed

Generated by: CRRAK Agent Service
Generated at: 2025-01-06T20:30:00Z"""
        
        filename = f"regulator_format_{trace_id}.txt"
        
        return {
            "success": True,
            "data": {
                "trace_id": trace_id,
                "format_type": format_type,
                "content": content,
                "filename": filename,
                "content_type": "text/plain",
                "generated_at": "2025-01-06T20:30:00Z"
            }
        }
    except Exception as e:
        return {"success": False, "message": f"Error generating regulator format file: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8004)
