from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime

class Remitter(BaseModel):
    accountNumber: str
    accountHolderName: str
    mobileNumber: Optional[str]
    email: Optional[str]
    bankName: str
    ifscCode: str

class Beneficiary(BaseModel):
    accountNumber: str
    accountHolderName: str
    bankName: str
    ifscCode: str
    mobileNumber: Optional[str]
    email: Optional[str]

class BankResponse(BaseModel):
    transactionId: str
    requestUUID: str
    sourceReferenceNumber: str
    transactionType: str
    transactionDate: str
    amount: float
    currency: str
    channelId: str
    txnInitChannel: str
    remitter: Remitter
    beneficiary: Beneficiary
    response: Dict
    additionalDetails: Optional[Dict] = None   # <-- optional
    processingTimeMs: Optional[int] = None     # <-- optional

class PDROutput(BaseModel):
    line_id: str
    batch_id: str
    rail_selected: str
    fallbacks: Dict
    expected_amount: float
    expected_currency: str
    expected_utr: str
    status: str
    created_at: datetime

class ReconciliationResult(BaseModel):
    line_id: str
    batch_id: str
    utr: Optional[str]
    match_status: str   # MATCHED / EXCEPTION
    match_reason: str
    journal: Optional[Dict]
    exception: Optional[str]
    timestamp: datetime
