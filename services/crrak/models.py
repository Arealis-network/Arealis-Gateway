# services/crrak/models.py
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
from typing import Union


class ACCDecision(BaseModel):
    line_id: str
    decision: str
    reason: str
    policy_version: str
    created_at: datetime

class Neo4jGraphNode(BaseModel):
    from_: str
    id: str
    to: str
    agent: Optional[str] = None
    decision: Optional[str] = None
    status: Optional[str] = None
    rail: Optional[str] = None
    reason: Optional[str] = None

class Neo4jGraph(BaseModel):
    batch_id: str
    line_id: str
    graph: List[Dict]

class PDROutput(BaseModel):
    line_id: str
    batch_id: str
    rail_selected: str
    fallbacks: Dict[str,str]
    expected_amount: float
    expected_currency: str
    expected_utr: str
    status: str
    created_at: datetime

class RCAResult(BaseModel):
    rca_id: int
    line_id: str
    batch_id: str
    root_cause: str
    failure_category: str
    recommended_action: str
    evidence_refs: Dict[str, Union[str, int]]
    created_at: datetime

class ReconciliationResult(BaseModel):
    recon_id: int
    line_id: str
    utr: str
    psp_reference: str
    match_status: str
    match_reason: str
    journal: Dict[str,str]
    metadata: Dict[str,str]
    created_at: datetime

class RedisRecord(BaseModel):
    line_id: str
    execution_timeline: List[Dict]
    system_health: Dict[str,str]
    ttl: int

class CRRAKQuery(BaseModel):
    query: str
