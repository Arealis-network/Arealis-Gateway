from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils import load_json, save_json
from models import BankResponse, PDROutput
from arl_logic import reconcile
from typing import List

app = FastAPI(title="ARL Agent", description="Reconciliation Service for Arealis Gateway")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:3002", "http://localhost:3003"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "ARL Agent Service", "status": "running", "version": "1.0"}

@app.get("/arl/overview-metrics")
async def get_overview_metrics():
    """Get overview metrics for ARL service"""
    return {
        "total_transactions": 1250,
        "reconciled": 1180,
        "pending": 45,
        "discrepancies": 25,
        "success_rate": 94.4,
        "last_updated": "2024-01-15T10:30:00Z"
    }

@app.post("/reconcile")
def reconcile_batch():
    # Load datasets
    bank_data_list = load_json("bank_responses.json")   # list
    pdr_data_list = load_json("pdr_outputs.json")       # list

    results = []

    for bank_data, pdr_data in zip(bank_data_list, pdr_data_list):
        bank = BankResponse(**bank_data)
        pdr = PDROutput(**pdr_data)
        result = reconcile(bank, pdr)
        results.append(result.dict())

    # Save result list
    save_json("reconciliation_results.json", results)

    return {"status": "success", "reconciliation_results": results}
