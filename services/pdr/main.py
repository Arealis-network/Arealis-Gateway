from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import requests
import json
from datetime import datetime, timedelta

app = FastAPI(title="PDR Agent Service", version="1.0")

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
    return {"message": "PDR Agent Service", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "pdr"}

@app.get("/pdr/live-queue")
async def get_live_queue(api_key: str = Depends(verify_api_key)):
    """Get live queue data for PDR agent"""
    try:
        # Fetch real data from ACC service
        acc_response = requests.get("http://localhost:8000/acc/vendor-payments", 
                                  headers={"X-API-Key": "arealis_api_key_2024"})
        
        if acc_response.status_code == 200:
            acc_data = acc_response.json()
            kpis = acc_data.get("data", {}).get("kpis", {})
            transactions = acc_data.get("data", {}).get("transactions", [])
            
            # Calculate real queue metrics from ACC data
            total_transactions = kpis.get("vendors_count", 0) + kpis.get("pending_approvals", 0)
            in_queue = kpis.get("pending_approvals", 0)
            release_queue = min(in_queue, 50)  # Assume some are in release queue
            success_rate = (kpis.get("vendors_count", 0) / total_transactions * 100) if total_transactions > 0 else 98.7
            
            return {
                "success": True,
                "data": {
                    "queue_metrics": {
                        "in_queue": in_queue,
                        "release_queue": release_queue,
                        "success_rate": round(success_rate, 1),
                        "queue_change_percent": 18.2,
                        "rescore_in_minutes": 2
                    },
                    "pending_payments": [
                {
                    "id": "TXN-001",
                    "amount": "₹12,000",
                    "rail_candidate": "IMPS",
                    "next_action": "Route",
                    "age": "2m",
                    "sla_status": "on_track"
                },
                {
                    "id": "TXN-002", 
                    "amount": "₹55,000",
                    "rail_candidate": "NEFT",
                    "next_action": "Re-score",
                    "age": "5m",
                    "sla_status": "warning"
                }
                    ],
                    "release_queue_payments": [
                {
                    "id": "TXN-003",
                    "amount": "₹25,000",
                    "selected_rail": "RTGS",
                    "rescore_at": "10:25:00",
                    "shift_possible": "Yes",
                    "age": "1m"
                }
                    ],
                    "dispatched_payments": [
                        {
                            "id": "TXN-004",
                            "amount": "₹8,000",
                            "rail": "IMPS",
                            "utr": "UTR2024001230456",
                            "status": "Success",
                            "time": "10:20:15"
                        }
                    ]
                }
            }
    except Exception as e:
            print(f"Error fetching real data: {e}")
            # Fallback to static data
            return {
                "success": True,
                "data": {
                    "queue_metrics": {
                        "in_queue": 2847,
                        "release_queue": 312,
                        "success_rate": 98.7,
                        "queue_change_percent": 18.2,
                        "rescore_in_minutes": 2
                    },
                    "pending_payments": [
                        {
                            "id": "TXN-001",
                            "amount": "₹12,000",
                            "rail_candidate": "IMPS",
                            "next_action": "Route",
                            "age": "2m",
                            "sla_status": "on_track"
                        },
                        {
                            "id": "TXN-002", 
                            "amount": "₹55,000",
                            "rail_candidate": "NEFT",
                            "next_action": "Re-score",
                            "age": "5m",
                            "sla_status": "warning"
                        }
                    ],
                    "release_queue_payments": [
                        {
                            "id": "TXN-003",
                            "amount": "₹25,000",
                            "selected_rail": "RTGS",
                            "rescore_at": "10:25:00",
                            "shift_possible": "Yes",
                            "age": "1m"
                        }
                    ],
                    "dispatched_payments": [
                        {
                            "id": "TXN-004",
                            "amount": "₹8,000",
                            "rail": "IMPS",
                            "utr": "UTR2024001230456",
                            "status": "Success",
                            "time": "10:20:15"
                        }
                    ]
                }
            }

@app.get("/pdr/rail-health")
async def get_rail_health(api_key: str = Depends(verify_api_key)):
    """Get rail health data for PDR agent"""
    return {
        "success": True,
        "data": {
            "rail_performance": [
                {
                    "rail_name": "IMPS",
                    "success_rate": 98.5,
                    "avg_latency": 0.8,
                    "last_updated": "2024-01-15T10:25:00Z"
                },
                {
                    "rail_name": "NEFT", 
                    "success_rate": 92.1,
                    "avg_latency": 1.2,
                    "last_updated": "2024-01-15T10:25:00Z"
                },
                {
                    "rail_name": "RTGS",
                    "success_rate": 99.2,
                    "avg_latency": 0.5,
                    "last_updated": "2024-01-15T10:25:00Z"
                }
            ],
            "rail_advisories": [
                {
                    "rail_name": "NEFT",
                    "severity": "high",
                    "message": "penalty high, window closing"
                },
                {
                    "rail_name": "IMPS",
                    "severity": "low", 
                    "message": "prefer for next 30m"
                }
            ],
            "cutoff_timers": [
                {
                    "rail": "NEFT",
                    "time_remaining": "In 22m",
                    "tone": "warning"
                },
                {
                    "rail": "RTGS",
                    "time_remaining": "In 2h 10m", 
                    "tone": "default"
                },
                {
                    "rail": "IMPS",
                    "time_remaining": "No cut-off",
                    "tone": "success"
                }
            ]
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
