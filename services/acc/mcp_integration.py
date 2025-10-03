"""
MCP Integration for ACC Service
Integrates ACC service with MCP server for database operations.
"""

import asyncio
import sys
import os
from pathlib import Path

# Add PDR service path to import MCP client
pdr_path = Path(__file__).parent.parent / "pdr"
sys.path.append(str(pdr_path))

from mcp_client import MCPClient, MCPSession
import logging

logger = logging.getLogger(__name__)


class ACCMCPIntegration:
    """
    ACC service integration with MCP server.
    Provides database operations for ACC decisions and compliance tracking.
    """
    
    def __init__(self):
        # Use the PDR MCP server
        self.mcp_client = MCPClient()
    
    async def save_acc_decision(
        self,
        transaction_id: str,
        decision: str,
        policy_version: str,
        reasons: list = None,
        evidence_refs: list = None,
        compliance_penalty: float = 0.0,
        risk_score: float = 0.0
    ) -> dict:
        """Save ACC decision to database via MCP"""
        try:
            async with MCPSession(self.mcp_client) as client:
                result = await client.create_acc_decision(
                    transaction_id=transaction_id,
                    decision=decision,
                    policy_version=policy_version,
                    reasons=reasons or [],
                    compliance_penalty=compliance_penalty,
                    risk_score=risk_score
                )
                
                logger.info(f"Saved ACC decision for {transaction_id}: {decision}")
                return result
                
        except Exception as e:
            logger.error(f"Failed to save ACC decision for {transaction_id}: {e}")
            return {"error": str(e)}
    
    async def get_acc_decision(self, transaction_id: str) -> dict:
        """Get existing ACC decision from database"""
        try:
            async with MCPSession(self.mcp_client) as client:
                result = await client.get_acc_decision(transaction_id)
                return result or {}
                
        except Exception as e:
            logger.error(f"Failed to get ACC decision for {transaction_id}: {e}")
            return {"error": str(e)}
    
    async def get_intent_details(self, transaction_id: str) -> dict:
        """Get intent details for compliance checking"""
        try:
            async with MCPSession(self.mcp_client) as client:
                result = await client.get_intent(transaction_id)
                return result or {}
                
        except Exception as e:
            logger.error(f"Failed to get intent for {transaction_id}: {e}")
            return {"error": str(e)}
    
    async def update_intent_status(self, transaction_id: str, status: str) -> dict:
        """Update intent status after ACC processing"""
        try:
            async with MCPSession(self.mcp_client) as client:
                result = await client.update_intent_status(transaction_id, status)
                return result
                
        except Exception as e:
            logger.error(f"Failed to update intent status for {transaction_id}: {e}")
            return {"error": str(e)}
    
    async def get_compliance_analytics(self, period: str = "24h") -> dict:
        """Get compliance analytics and statistics"""
        try:
            async with MCPSession(self.mcp_client) as client:
                # Get system stats
                system_stats = await client.get_system_stats(period)
                
                # Get analytics dashboard
                dashboard = await client.get_analytics_dashboard()
                
                return {
                    "period": period,
                    "system_stats": system_stats,
                    "dashboard": dashboard
                }
                
        except Exception as e:
            logger.error(f"Failed to get compliance analytics: {e}")
            return {"error": str(e)}
    
    async def health_check(self) -> dict:
        """Check MCP server health"""
        try:
            async with MCPSession(self.mcp_client) as client:
                return await client.health_check()
                
        except Exception as e:
            logger.error(f"MCP health check failed: {e}")
            return {"status": "unhealthy", "error": str(e)}


# Global instance
acc_mcp = ACCMCPIntegration()


# ========================================
# Enhanced ACC Decision Logic
# ========================================

async def enhanced_acc_decide(transactions: list) -> dict:
    """
    Enhanced ACC decision logic with MCP integration.
    Saves decisions to database and provides better tracking.
    """
    results = []
    
    for txn in transactions:
        transaction_id = txn.get("transaction_id")
        
        # Check if we already have an ACC decision
        existing_decision = await acc_mcp.get_acc_decision(transaction_id)
        if existing_decision and not existing_decision.get("error"):
            # Return existing decision
            results.append({
                "line_id": transaction_id,
                "decision": existing_decision.get("decision", "PASS"),
                "policy_version": existing_decision.get("policy_version", "acc-1.4.2"),
                "reasons": existing_decision.get("reasons", []),
                "evidence_refs": existing_decision.get("evidence_refs", []),
                "compliance_penalty": existing_decision.get("compliance_penalty", 0.0),
                "risk_score": existing_decision.get("risk_score", 0.0),
                "source": "existing"
            })
            continue
        
        # Perform verification (existing logic)
        verifications = {}
        
        # PAN verification
        if txn.get("additional_fields", {}).get("pan_number"):
            from main import verify_pan
            verifications["pan"] = verify_pan(txn["additional_fields"]["pan_number"])
        
        # GST verification
        if txn.get("additional_fields", {}).get("gst_number"):
            from main import verify_gstin
            verifications["gstin"] = verify_gstin(
                txn["additional_fields"]["gst_number"], 
                txn.get("receiver", {}).get("name", "")
            )
        
        # Bank verification
        receiver = txn.get("receiver", {})
        if receiver.get("account_number") and receiver.get("ifsc_code"):
            from main import verify_bank
            verifications["bank"] = verify_bank(
                receiver["account_number"],
                receiver["ifsc_code"],
                receiver.get("name", ""),
                None
            )
        
        # Calculate compliance penalty and risk score
        compliance_penalty = 0.0
        risk_score = 0.0
        reasons = []
        
        # Analyze verifications
        for verification_type, result in verifications.items():
            if verification_type == "pan":
                if result.get("verification") != "success":
                    compliance_penalty += 15.0
                    risk_score += 10.0
                    reasons.append("PAN verification failed")
            
            elif verification_type == "gstin":
                if not result.get("valid", False):
                    compliance_penalty += 20.0
                    risk_score += 15.0
                    reasons.append("GST verification failed")
            
            elif verification_type == "bank":
                if result.get("account_status") != "VALID":
                    compliance_penalty += 25.0
                    risk_score += 20.0
                    reasons.append("Bank account verification failed")
                elif result.get("name_match_result") == "MISMATCH":
                    compliance_penalty += 10.0
                    risk_score += 8.0
                    reasons.append("Account holder name mismatch")
        
        # Determine final decision
        decision = "FAIL" if compliance_penalty > 30.0 or risk_score > 25.0 else "PASS"
        
        # Additional risk factors
        amount = float(txn.get("amount", 0))
        if amount > 500000:  # > 5 Lakh
            risk_score += 5.0
        if amount > 1000000:  # > 10 Lakh
            compliance_penalty += 5.0
            reasons.append("High value transaction")
        
        # Save ACC decision to database
        acc_decision_result = await acc_mcp.save_acc_decision(
            transaction_id=transaction_id,
            decision=decision,
            policy_version="acc-1.4.2-enhanced",
            reasons=reasons,
            evidence_refs=list(verifications.keys()),
            compliance_penalty=min(compliance_penalty, 100.0),  # Cap at 100
            risk_score=min(risk_score, 100.0)  # Cap at 100
        )
        
        # Update intent status if decision saved successfully
        if not acc_decision_result.get("error"):
            await acc_mcp.update_intent_status(transaction_id, "PROCESSING")
        
        results.append({
            "line_id": transaction_id,
            "decision": decision,
            "policy_version": "acc-1.4.2-enhanced",
            "reasons": reasons,
            "evidence_refs": list(verifications.keys()),
            "compliance_penalty": min(compliance_penalty, 100.0),
            "risk_score": min(risk_score, 100.0),
            "source": "new",
            "mcp_saved": not acc_decision_result.get("error", False)
        })
    
    return {"decisions": results}


# ========================================
# Async Wrapper for FastAPI
# ========================================

def run_async_acc_decide(transactions: list) -> dict:
    """Synchronous wrapper for async ACC decide function"""
    try:
        # Create new event loop if none exists
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        # Run the async function
        return loop.run_until_complete(enhanced_acc_decide(transactions))
        
    except Exception as e:
        logger.error(f"Error in async ACC decide: {e}")
        # Fallback to basic decision
        return {
            "decisions": [{
                "line_id": txn.get("transaction_id", "unknown"),
                "decision": "ERROR",
                "policy_version": "acc-1.4.2-fallback",
                "reasons": [str(e)],
                "evidence_refs": [],
                "compliance_penalty": 50.0,
                "risk_score": 50.0,
                "source": "error"
            } for txn in transactions]
        }