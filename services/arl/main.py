from fastapi import FastAPI
from utils import load_json, save_json
from models import BankResponse, PDROutput
from arl_logic import reconcile
from typing import List

app = FastAPI(title="ARL Agent", description="Reconciliation Service for Arealis Gateway")

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
