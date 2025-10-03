"""
MCP (Model Context Protocol) Server for PDR System
Provides database access tools and resources for AI agents.
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union
from decimal import Decimal

from mcp.server import Server
from mcp.server.models import InitializationOptions
from mcp.server.stdio import stdio_server
from mcp.types import (
    Resource, Tool, TextContent, ImageContent, EmbeddedResource,
    CallToolRequest, GetResourceRequest, ListResourcesRequest, ListToolsRequest
)

from database import db_manager
from models import *
from scoring_engine import RailScoringEngine
from mock_rail_apis import MockRailAPIs

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize components
scoring_engine = RailScoringEngine()
mock_rail_apis = MockRailAPIs()

# Create MCP server
server = Server("pdr-database-server")


# ========================================
# MCP Resources (Data Access)
# ========================================

@server.list_resources()
async def list_resources() -> List[Resource]:
    """List available database resources"""
    return [
        Resource(
            uri="pdr://intents",
            name="Payment Intents",
            description="All payment intents in the system",
            mimeType="application/json"
        ),
        Resource(
            uri="pdr://intents/pending",
            name="Pending Intents",
            description="Intents waiting for processing",
            mimeType="application/json"
        ),
        Resource(
            uri="pdr://rails",
            name="Rail Configurations",
            description="Available payment rail configurations",
            mimeType="application/json"
        ),
        Resource(
            uri="pdr://rails/active",
            name="Active Rails",
            description="Currently active payment rails",
            mimeType="application/json"
        ),
        Resource(
            uri="pdr://decisions",
            name="PDR Decisions",
            description="All PDR routing decisions",
            mimeType="application/json"
        ),
        Resource(
            uri="pdr://acc-decisions",
            name="ACC Decisions",
            description="Anti-compliance check decisions",
            mimeType="application/json"
        ),
        Resource(
            uri="pdr://performance",
            name="Rail Performance",
            description="Historical rail performance data",
            mimeType="application/json"
        ),
        Resource(
            uri="pdr://analytics/dashboard",
            name="Analytics Dashboard",
            description="Key metrics and KPIs for the PDR system",
            mimeType="application/json"
        )
    ]


@server.get_resource()
async def get_resource(uri: str) -> str:
    """Get resource content by URI"""
    try:
        if uri == "pdr://intents":
            # Get all intents (limited to recent 1000)
            intents = db_manager.get_pending_intents(1000)
            return json.dumps([intent.dict() for intent in intents], default=str, indent=2)
        
        elif uri == "pdr://intents/pending":
            # Get pending intents only
            pending_intents = db_manager.get_pending_intents(100)
            return json.dumps([intent.dict() for intent in pending_intents], default=str, indent=2)
        
        elif uri == "pdr://rails" or uri == "pdr://rails/active":
            # Get rail configurations
            rails = db_manager.get_active_rails()
            return json.dumps([rail.dict() for rail in rails], default=str, indent=2)
        
        elif uri == "pdr://decisions":
            # Get recent PDR decisions
            decisions_data = []
            # This would need a method to get recent decisions - implementing basic version
            return json.dumps(decisions_data, default=str, indent=2)
        
        elif uri == "pdr://acc-decisions":
            # Get recent ACC decisions
            acc_decisions_data = []
            # This would need a method to get recent ACC decisions
            return json.dumps(acc_decisions_data, default=str, indent=2)
        
        elif uri == "pdr://performance":
            # Get rail performance statistics
            performance_data = {}
            rails = ["UPI", "IMPS", "NEFT", "RTGS", "IFT"]
            for rail in rails:
                stats = db_manager.get_rail_performance_stats(rail, 30)
                performance_data[rail] = stats
            return json.dumps(performance_data, default=str, indent=2)
        
        elif uri == "pdr://analytics/dashboard":
            # Generate analytics dashboard
            dashboard = await generate_analytics_dashboard()
            return json.dumps(dashboard, default=str, indent=2)
        
        else:
            raise ValueError(f"Unknown resource URI: {uri}")
            
    except Exception as e:
        logger.error(f"Error getting resource {uri}: {e}")
        return json.dumps({"error": str(e)}, indent=2)


# ========================================
# MCP Tools (Database Operations)
# ========================================

@server.list_tools()
async def list_tools() -> List[Tool]:
    """List available database tools"""
    return [
        # Intent Management Tools
        Tool(
            name="get_intent",
            description="Get a specific payment intent by transaction ID",
            inputSchema={
                "type": "object",
                "properties": {
                    "transaction_id": {
                        "type": "string",
                        "description": "The transaction ID to look up"
                    }
                },
                "required": ["transaction_id"]
            }
        ),
        Tool(
            name="create_intent",
            description="Create a new payment intent",
            inputSchema={
                "type": "object",
                "properties": {
                    "intent_data": {
                        "type": "object",
                        "description": "Complete intent data including sender, receiver, amount, etc."
                    }
                },
                "required": ["intent_data"]
            }
        ),
        Tool(
            name="update_intent_status",
            description="Update the status of a payment intent",
            inputSchema={
                "type": "object",
                "properties": {
                    "transaction_id": {"type": "string"},
                    "status": {
                        "type": "string",
                        "enum": ["PENDING", "PROCESSING", "COMPLETED", "FAILED"]
                    }
                },
                "required": ["transaction_id", "status"]
            }
        ),
        
        # PDR Decision Tools
        Tool(
            name="generate_pdr_decision",
            description="Generate PDR decision for a payment intent using scoring engine",
            inputSchema={
                "type": "object",
                "properties": {
                    "transaction_id": {"type": "string"},
                    "custom_weights": {
                        "type": "object",
                        "description": "Optional custom scoring weights",
                        "properties": {
                            "w_eta": {"type": "number"},
                            "w_cost": {"type": "number"},
                            "w_succ": {"type": "number"},
                            "w_comp": {"type": "number"},
                            "w_risk": {"type": "number"}
                        }
                    }
                },
                "required": ["transaction_id"]
            }
        ),
        Tool(
            name="get_pdr_decision",
            description="Get PDR decision for a transaction",
            inputSchema={
                "type": "object",
                "properties": {
                    "transaction_id": {"type": "string"}
                },
                "required": ["transaction_id"]
            }
        ),
        Tool(
            name="execute_rail_transaction",
            description="Execute a transaction using the selected rail",
            inputSchema={
                "type": "object",
                "properties": {
                    "transaction_id": {"type": "string"},
                    "force_rail": {
                        "type": "string",
                        "description": "Optional: force execution on specific rail"
                    }
                },
                "required": ["transaction_id"]
            }
        ),
        
        # ACC Integration Tools
        Tool(
            name="get_acc_decision",
            description="Get ACC (compliance) decision for a transaction",
            inputSchema={
                "type": "object",
                "properties": {
                    "transaction_id": {"type": "string"}
                },
                "required": ["transaction_id"]
            }
        ),
        Tool(
            name="create_acc_decision",
            description="Create or update ACC decision for a transaction",
            inputSchema={
                "type": "object",
                "properties": {
                    "transaction_id": {"type": "string"},
                    "decision": {
                        "type": "string",
                        "enum": ["PASS", "FAIL", "ERROR"]
                    },
                    "policy_version": {"type": "string"},
                    "reasons": {
                        "type": "array",
                        "items": {"type": "string"}
                    },
                    "compliance_penalty": {"type": "number"},
                    "risk_score": {"type": "number"}
                },
                "required": ["transaction_id", "decision", "policy_version"]
            }
        ),
        
        # Rail Management Tools
        Tool(
            name="get_rail_config",
            description="Get configuration for a specific rail",
            inputSchema={
                "type": "object",
                "properties": {
                    "rail_name": {"type": "string"}
                },
                "required": ["rail_name"]
            }
        ),
        Tool(
            name="update_rail_limits",
            description="Update daily limits for a rail",
            inputSchema={
                "type": "object",
                "properties": {
                    "rail_name": {"type": "string"},
                    "remaining_amount": {"type": "number"}
                },
                "required": ["rail_name", "remaining_amount"]
            }
        ),
        Tool(
            name="get_rail_performance",
            description="Get performance statistics for a rail",
            inputSchema={
                "type": "object",
                "properties": {
                    "rail_name": {"type": "string"},
                    "days": {
                        "type": "integer",
                        "default": 30,
                        "description": "Number of days to analyze"
                    }
                },
                "required": ["rail_name"]
            }
        ),
        
        # Analytics Tools
        Tool(
            name="get_transaction_analytics",
            description="Get analytics for transactions in a date range",
            inputSchema={
                "type": "object",
                "properties": {
                    "start_date": {"type": "string", "format": "date"},
                    "end_date": {"type": "string", "format": "date"},
                    "group_by": {
                        "type": "string",
                        "enum": ["rail", "status", "payment_type", "hour", "day"],
                        "default": "rail"
                    }
                }
            }
        ),
        Tool(
            name="run_sql_query",
            description="Execute a custom SQL query (read-only)",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "SQL SELECT query to execute"
                    },
                    "limit": {
                        "type": "integer",
                        "default": 100,
                        "description": "Maximum number of rows to return"
                    }
                },
                "required": ["query"]
            }
        ),
        
        # System Tools
        Tool(
            name="health_check",
            description="Check system health and database connectivity",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        Tool(
            name="get_system_stats",
            description="Get overall system statistics and KPIs",
            inputSchema={
                "type": "object",
                "properties": {
                    "period": {
                        "type": "string",
                        "enum": ["1h", "24h", "7d", "30d"],
                        "default": "24h"
                    }
                }
            }
        )
    ]


@server.call_tool()
async def call_tool(name: str, arguments: Dict[str, Any]) -> List[TextContent]:
    """Handle tool calls"""
    try:
        result = await execute_tool(name, arguments)
        return [TextContent(type="text", text=json.dumps(result, default=str, indent=2))]
    except Exception as e:
        logger.error(f"Error executing tool {name}: {e}")
        return [TextContent(type="text", text=json.dumps({"error": str(e)}, indent=2))]


async def execute_tool(name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a specific tool"""
    
    if name == "get_intent":
        transaction_id = arguments["transaction_id"]
        intent = db_manager.get_intent_by_transaction_id(transaction_id)
        return {"intent": intent.dict() if intent else None}
    
    elif name == "create_intent":
        intent_data = arguments["intent_data"]
        # This would need implementation to create intent from data
        return {"status": "created", "transaction_id": intent_data.get("transaction_id")}
    
    elif name == "update_intent_status":
        transaction_id = arguments["transaction_id"]
        status = IntentStatus(arguments["status"])
        db_manager.update_intent_status(transaction_id, status)
        return {"status": "updated", "transaction_id": transaction_id, "new_status": status.value}
    
    elif name == "generate_pdr_decision":
        transaction_id = arguments["transaction_id"]
        
        # Get intent
        intent = db_manager.get_intent_by_transaction_id(transaction_id)
        if not intent:
            return {"error": "Intent not found"}
        
        # Get ACC decision
        acc_decision = db_manager.get_acc_decision(transaction_id)
        if not acc_decision:
            # Create default ACC decision
            acc_decision = ACCDecision(
                transaction_id=transaction_id,
                line_id=transaction_id,
                decision=DecisionStatus.PASS,
                policy_version="default",
                compliance_penalty=5.0,
                risk_score=10.0
            )
            db_manager.save_acc_decision(acc_decision)
        
        # Apply custom weights if provided
        custom_weights = arguments.get("custom_weights")
        if custom_weights:
            scoring_engine.weights = ScoringWeights(**custom_weights)
        
        # Generate decision
        available_rails = db_manager.get_active_rails()
        scored_rails, filter_reasons = scoring_engine.select_rails(intent, available_rails, acc_decision)
        
        if not scored_rails:
            return {"error": "No eligible rails", "filter_reasons": filter_reasons}
        
        # Create PDR decision
        primary_rail = scored_rails[0]
        fallback_rails = [
            FallbackRail(rail_name=rail.rail_name, score=rail.score)
            for rail in scored_rails[1:]
        ]
        
        explainability = scoring_engine.get_explainability_report(scored_rails)
        
        pdr_decision = PDRDecision(
            transaction_id=transaction_id,
            primary_rail=primary_rail.rail_name,
            primary_rail_score=primary_rail.score,
            fallback_rails=fallback_rails,
            scoring_features=explainability,
            scoring_weights=scoring_engine.weights
        )
        
        # Save decision
        db_manager.save_pdr_decision(pdr_decision)
        
        return {
            "pdr_decision": pdr_decision.dict(),
            "explainability": explainability,
            "scored_rails": [{"rail": r.rail_name, "score": r.score} for r in scored_rails]
        }
    
    elif name == "get_pdr_decision":
        transaction_id = arguments["transaction_id"]
        decision = db_manager.get_pdr_decision(transaction_id)
        return {"pdr_decision": decision.dict() if decision else None}
    
    elif name == "execute_rail_transaction":
        transaction_id = arguments["transaction_id"]
        force_rail = arguments.get("force_rail")
        
        # Get intent and PDR decision
        intent = db_manager.get_intent_by_transaction_id(transaction_id)
        pdr_decision = db_manager.get_pdr_decision(transaction_id)
        
        if not intent or not pdr_decision:
            return {"error": "Intent or PDR decision not found"}
        
        # Determine rail to use
        rail_to_use = force_rail or pdr_decision.primary_rail
        
        # Execute
        rail_request = RailExecutionRequest(
            transaction_id=transaction_id,
            rail_name=rail_to_use,
            intent=intent,
            retry_attempt=0
        )
        
        result = mock_rail_apis.execute_rail(rail_request)
        
        # Update PDR decision status
        if result.success:
            db_manager.update_pdr_execution_status(
                transaction_id, ExecutionStatus.SUCCESS,
                final_rail_used=rail_to_use,
                final_utr_number=result.utr_number,
                final_status=ExecutionStatus.SUCCESS
            )
        else:
            db_manager.update_pdr_execution_status(
                transaction_id, ExecutionStatus.FAILED,
                final_status=ExecutionStatus.FAILED
            )
        
        return {"execution_result": result.dict()}
    
    elif name == "get_acc_decision":
        transaction_id = arguments["transaction_id"]
        acc_decision = db_manager.get_acc_decision(transaction_id)
        return {"acc_decision": acc_decision.dict() if acc_decision else None}
    
    elif name == "create_acc_decision":
        acc_decision = ACCDecision(
            transaction_id=arguments["transaction_id"],
            line_id=arguments["transaction_id"],
            decision=DecisionStatus(arguments["decision"]),
            policy_version=arguments["policy_version"],
            reasons=arguments.get("reasons", []),
            evidence_refs=arguments.get("evidence_refs", []),
            compliance_penalty=arguments.get("compliance_penalty", 0.0),
            risk_score=arguments.get("risk_score", 0.0)
        )
        db_manager.save_acc_decision(acc_decision)
        return {"status": "created", "acc_decision": acc_decision.dict()}
    
    elif name == "get_rail_config":
        rail_name = arguments["rail_name"]
        rail_config = db_manager.get_rail_config(rail_name)
        return {"rail_config": rail_config.dict() if rail_config else None}
    
    elif name == "update_rail_limits":
        rail_name = arguments["rail_name"]
        remaining_amount = Decimal(str(arguments["remaining_amount"]))
        db_manager.update_rail_daily_limit_remaining(rail_name, remaining_amount)
        return {"status": "updated", "rail_name": rail_name, "remaining_amount": float(remaining_amount)}
    
    elif name == "get_rail_performance":
        rail_name = arguments["rail_name"]
        days = arguments.get("days", 30)
        stats = db_manager.get_rail_performance_stats(rail_name, days)
        return {"performance_stats": stats}
    
    elif name == "get_transaction_analytics":
        # This would need implementation for analytics queries
        return {"analytics": "Not implemented yet"}
    
    elif name == "run_sql_query":
        query = arguments["query"]
        limit = arguments.get("limit", 100)
        
        # Basic security check - only allow SELECT queries
        if not query.strip().upper().startswith("SELECT"):
            return {"error": "Only SELECT queries are allowed"}
        
        # Execute query (this would need proper implementation)
        return {"query_result": "Query execution not implemented yet"}
    
    elif name == "health_check":
        db_healthy = db_manager.health_check()
        return {
            "status": "healthy" if db_healthy else "unhealthy",
            "database": "connected" if db_healthy else "disconnected",
            "timestamp": datetime.now().isoformat()
        }
    
    elif name == "get_system_stats":
        period = arguments.get("period", "24h")
        stats = await get_system_statistics(period)
        return {"system_stats": stats}
    
    else:
        return {"error": f"Unknown tool: {name}"}


# ========================================
# Helper Functions
# ========================================

async def generate_analytics_dashboard() -> Dict[str, Any]:
    """Generate analytics dashboard data"""
    
    # Get rail performance
    rails = ["UPI", "IMPS", "NEFT", "RTGS", "IFT"]
    rail_stats = {}
    for rail in rails:
        stats = db_manager.get_rail_performance_stats(rail, 30)
        rail_stats[rail] = stats
    
    # Get pending intents count
    pending_intents = db_manager.get_pending_intents(1000)
    pending_count = len(pending_intents)
    
    # Mock API statistics
    api_stats = mock_rail_apis.get_statistics()
    
    return {
        "timestamp": datetime.now().isoformat(),
        "rail_performance": rail_stats,
        "pending_intents": pending_count,
        "api_statistics": api_stats,
        "system_health": {
            "database": db_manager.health_check(),
            "services": ["PDR", "ACC", "MCP"]
        }
    }


async def get_system_statistics(period: str) -> Dict[str, Any]:
    """Get system statistics for a given period"""
    
    # This would need proper implementation based on the period
    return {
        "period": period,
        "total_transactions": 0,
        "successful_transactions": 0,
        "failed_transactions": 0,
        "average_processing_time_ms": 0,
        "rail_usage": {},
        "error_rates": {}
    }


# ========================================
# MCP Server Startup
# ========================================

async def main():
    """Run the MCP server"""
    logger.info("Starting PDR MCP Server...")
    
    # Initialize database connection
    if not db_manager.health_check():
        logger.error("Database connection failed!")
        return
    
    logger.info("Database connection established")
    logger.info("MCP Server ready for connections")
    
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="pdr-database-server",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=None,
                    experimental_capabilities=None
                )
            )
        )


if __name__ == "__main__":
    asyncio.run(main())