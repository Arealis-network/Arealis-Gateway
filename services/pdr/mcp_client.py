"""
MCP Client for PDR Service
Provides easy access to MCP server functionality from PDR service.
"""

import asyncio
import json
import logging
from typing import Any, Dict, List, Optional

from mcp.client.session import ClientSession
from mcp.client.stdio import stdio_client

logger = logging.getLogger(__name__)


class MCPClient:
    """
    MCP Client for interacting with the PDR database server.
    Provides high-level methods for common database operations.
    """
    
    def __init__(self, server_command: List[str] = None):
        self.server_command = server_command or ["python", "/workspace/services/pdr/mcp_server.py"]
        self.session: Optional[ClientSession] = None
        self._connected = False
    
    async def connect(self):
        """Connect to the MCP server"""
        if self._connected:
            return
        
        try:
            # Start the MCP server process and connect
            self.session = await stdio_client(self.server_command)
            await self.session.initialize()
            self._connected = True
            logger.info("Connected to MCP server")
        except Exception as e:
            logger.error(f"Failed to connect to MCP server: {e}")
            raise
    
    async def disconnect(self):
        """Disconnect from the MCP server"""
        if self.session and self._connected:
            await self.session.close()
            self._connected = False
            logger.info("Disconnected from MCP server")
    
    async def ensure_connected(self):
        """Ensure connection to MCP server"""
        if not self._connected:
            await self.connect()
    
    # ========================================
    # Intent Operations
    # ========================================
    
    async def get_intent(self, transaction_id: str) -> Optional[Dict[str, Any]]:
        """Get a payment intent by transaction ID"""
        await self.ensure_connected()
        
        result = await self.session.call_tool("get_intent", {"transaction_id": transaction_id})
        if result and result.content:
            data = json.loads(result.content[0].text)
            return data.get("intent")
        return None
    
    async def create_intent(self, intent_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new payment intent"""
        await self.ensure_connected()
        
        result = await self.session.call_tool("create_intent", {"intent_data": intent_data})
        if result and result.content:
            return json.loads(result.content[0].text)
        return {"error": "Failed to create intent"}
    
    async def update_intent_status(self, transaction_id: str, status: str) -> Dict[str, Any]:
        """Update intent status"""
        await self.ensure_connected()
        
        result = await self.session.call_tool("update_intent_status", {
            "transaction_id": transaction_id,
            "status": status
        })
        if result and result.content:
            return json.loads(result.content[0].text)
        return {"error": "Failed to update intent status"}
    
    async def get_pending_intents(self) -> List[Dict[str, Any]]:
        """Get all pending intents"""
        await self.ensure_connected()
        
        resource = await self.session.read_resource("pdr://intents/pending")
        if resource and resource.contents:
            return json.loads(resource.contents[0].text)
        return []
    
    # ========================================
    # PDR Decision Operations
    # ========================================
    
    async def generate_pdr_decision(
        self, 
        transaction_id: str, 
        custom_weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """Generate PDR decision for a transaction"""
        await self.ensure_connected()
        
        args = {"transaction_id": transaction_id}
        if custom_weights:
            args["custom_weights"] = custom_weights
        
        result = await self.session.call_tool("generate_pdr_decision", args)
        if result and result.content:
            return json.loads(result.content[0].text)
        return {"error": "Failed to generate PDR decision"}
    
    async def get_pdr_decision(self, transaction_id: str) -> Optional[Dict[str, Any]]:
        """Get PDR decision for a transaction"""
        await self.ensure_connected()
        
        result = await self.session.call_tool("get_pdr_decision", {"transaction_id": transaction_id})
        if result and result.content:
            data = json.loads(result.content[0].text)
            return data.get("pdr_decision")
        return None
    
    async def execute_rail_transaction(
        self, 
        transaction_id: str, 
        force_rail: Optional[str] = None
    ) -> Dict[str, Any]:
        """Execute a rail transaction"""
        await self.ensure_connected()
        
        args = {"transaction_id": transaction_id}
        if force_rail:
            args["force_rail"] = force_rail
        
        result = await self.session.call_tool("execute_rail_transaction", args)
        if result and result.content:
            return json.loads(result.content[0].text)
        return {"error": "Failed to execute transaction"}
    
    # ========================================
    # ACC Operations
    # ========================================
    
    async def get_acc_decision(self, transaction_id: str) -> Optional[Dict[str, Any]]:
        """Get ACC decision for a transaction"""
        await self.ensure_connected()
        
        result = await self.session.call_tool("get_acc_decision", {"transaction_id": transaction_id})
        if result and result.content:
            data = json.loads(result.content[0].text)
            return data.get("acc_decision")
        return None
    
    async def create_acc_decision(
        self,
        transaction_id: str,
        decision: str,
        policy_version: str,
        reasons: List[str] = None,
        compliance_penalty: float = 0.0,
        risk_score: float = 0.0
    ) -> Dict[str, Any]:
        """Create ACC decision"""
        await self.ensure_connected()
        
        args = {
            "transaction_id": transaction_id,
            "decision": decision,
            "policy_version": policy_version,
            "compliance_penalty": compliance_penalty,
            "risk_score": risk_score
        }
        if reasons:
            args["reasons"] = reasons
        
        result = await self.session.call_tool("create_acc_decision", args)
        if result and result.content:
            return json.loads(result.content[0].text)
        return {"error": "Failed to create ACC decision"}
    
    # ========================================
    # Rail Operations
    # ========================================
    
    async def get_rail_config(self, rail_name: str) -> Optional[Dict[str, Any]]:
        """Get rail configuration"""
        await self.ensure_connected()
        
        result = await self.session.call_tool("get_rail_config", {"rail_name": rail_name})
        if result and result.content:
            data = json.loads(result.content[0].text)
            return data.get("rail_config")
        return None
    
    async def get_active_rails(self) -> List[Dict[str, Any]]:
        """Get all active rails"""
        await self.ensure_connected()
        
        resource = await self.session.read_resource("pdr://rails/active")
        if resource and resource.contents:
            return json.loads(resource.contents[0].text)
        return []
    
    async def get_rail_performance(self, rail_name: str, days: int = 30) -> Dict[str, Any]:
        """Get rail performance statistics"""
        await self.ensure_connected()
        
        result = await self.session.call_tool("get_rail_performance", {
            "rail_name": rail_name,
            "days": days
        })
        if result and result.content:
            data = json.loads(result.content[0].text)
            return data.get("performance_stats", {})
        return {}
    
    async def update_rail_limits(self, rail_name: str, remaining_amount: float) -> Dict[str, Any]:
        """Update rail daily limits"""
        await self.ensure_connected()
        
        result = await self.session.call_tool("update_rail_limits", {
            "rail_name": rail_name,
            "remaining_amount": remaining_amount
        })
        if result and result.content:
            return json.loads(result.content[0].text)
        return {"error": "Failed to update rail limits"}
    
    # ========================================
    # Analytics Operations
    # ========================================
    
    async def get_analytics_dashboard(self) -> Dict[str, Any]:
        """Get analytics dashboard data"""
        await self.ensure_connected()
        
        resource = await self.session.read_resource("pdr://analytics/dashboard")
        if resource and resource.contents:
            return json.loads(resource.contents[0].text)
        return {}
    
    async def get_system_stats(self, period: str = "24h") -> Dict[str, Any]:
        """Get system statistics"""
        await self.ensure_connected()
        
        result = await self.session.call_tool("get_system_stats", {"period": period})
        if result and result.content:
            data = json.loads(result.content[0].text)
            return data.get("system_stats", {})
        return {}
    
    async def health_check(self) -> Dict[str, Any]:
        """Check system health"""
        await self.ensure_connected()
        
        result = await self.session.call_tool("health_check", {})
        if result and result.content:
            return json.loads(result.content[0].text)
        return {"status": "unhealthy", "error": "No response from MCP server"}
    
    # ========================================
    # Batch Operations
    # ========================================
    
    async def process_pending_intents_batch(self, limit: int = 100) -> Dict[str, Any]:
        """Process multiple pending intents"""
        await self.ensure_connected()
        
        # Get pending intents
        pending_intents = await self.get_pending_intents()
        
        if not pending_intents:
            return {"processed": 0, "message": "No pending intents"}
        
        # Limit the batch size
        intents_to_process = pending_intents[:limit]
        results = []
        
        for intent_data in intents_to_process:
            transaction_id = intent_data.get("transaction_id")
            if not transaction_id:
                continue
            
            try:
                # Generate PDR decision
                pdr_result = await self.generate_pdr_decision(transaction_id)
                
                if "error" not in pdr_result:
                    # Update intent status to processing
                    await self.update_intent_status(transaction_id, "PROCESSING")
                    
                    results.append({
                        "transaction_id": transaction_id,
                        "status": "success",
                        "primary_rail": pdr_result.get("pdr_decision", {}).get("primary_rail")
                    })
                else:
                    results.append({
                        "transaction_id": transaction_id,
                        "status": "error",
                        "error": pdr_result.get("error")
                    })
                    
            except Exception as e:
                results.append({
                    "transaction_id": transaction_id,
                    "status": "error",
                    "error": str(e)
                })
        
        successful = len([r for r in results if r["status"] == "success"])
        
        return {
            "processed": len(results),
            "successful": successful,
            "failed": len(results) - successful,
            "results": results
        }


# Global MCP client instance
mcp_client = MCPClient()


# ========================================
# Context Manager for MCP Operations
# ========================================

class MCPSession:
    """Context manager for MCP operations"""
    
    def __init__(self, client: MCPClient = None):
        self.client = client or mcp_client
    
    async def __aenter__(self):
        await self.client.connect()
        return self.client
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        # Keep connection alive for reuse
        pass


# ========================================
# Convenience Functions
# ========================================

async def with_mcp(func, *args, **kwargs):
    """Execute a function with MCP client"""
    async with MCPSession() as client:
        return await func(client, *args, **kwargs)


# Example usage functions
async def quick_pdr_decision(transaction_id: str) -> Dict[str, Any]:
    """Quick PDR decision generation"""
    return await with_mcp(lambda client: client.generate_pdr_decision(transaction_id))


async def quick_rail_stats(rail_name: str) -> Dict[str, Any]:
    """Quick rail performance stats"""
    return await with_mcp(lambda client: client.get_rail_performance(rail_name))


async def quick_health_check() -> Dict[str, Any]:
    """Quick system health check"""
    return await with_mcp(lambda client: client.health_check())