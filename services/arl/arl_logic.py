from datetime import datetime
from models import BankResponse, PDROutput, ReconciliationResult

def reconcile(bank: BankResponse, pdr: PDROutput) -> ReconciliationResult:
    """
    Match Bank Response with PDR output.
    Rules:
    - UTR match
    - Amount match (±1% tolerance)
    - Currency match
    """
    match_status = "EXCEPTION"
    match_reason = "No match"
    journal = None
    exception = None

    # Check UTR
    utr_bank = bank.response.get("utrNumber")
    utr_expected = pdr.expected_utr

    utr_match = (utr_bank == utr_expected)

    # Check amount (with ±1% tolerance)
    tolerance = 0.01 * pdr.expected_amount
    amt_match = abs(bank.amount - pdr.expected_amount) <= tolerance

    # Check currency
    currency_match = (bank.currency == pdr.expected_currency)

    if utr_match and amt_match and currency_match:
        match_status = "MATCHED"
        match_reason = "UTR+Amount+Currency"
        journal = {
            "debit": {"account": "Expense", "amount": pdr.expected_amount},
            "credit": {"account": "Bank", "amount": pdr.expected_amount}
        }
    else:
        exception = "Mismatch detected"
        if not utr_match:
            exception = "UTR mismatch"
        elif not amt_match:
            exception = "Amount mismatch"
        elif not currency_match:
            exception = "Currency mismatch"

    return ReconciliationResult(
        line_id=pdr.line_id,
        batch_id=pdr.batch_id,
        utr=utr_bank,
        match_status=match_status,
        match_reason=match_reason,
        journal=journal,
        exception=exception,
        timestamp=datetime.utcnow()
    )
