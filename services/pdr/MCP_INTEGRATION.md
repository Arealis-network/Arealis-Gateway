# MCP (Model Context Protocol) Integration

Complete MCP server integration for the PDR system, providing AI agents with sophisticated database access capabilities.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ACC Agent     │    │   PDR Service   │    │  AI Agents      │
│   (Port 8000)   │    │   (Port 8001)   │    │  (External)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      MCP Server           │
                    │  • 20+ Database Tools     │
                    │  • 8 Resource Endpoints   │
                    │  • Real-time Analytics    │
                    │  • Batch Processing       │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │   PostgreSQL Database     │
                    │  • Intent Management      │
                    │  • ACC Decisions          │
                    │  • PDR Decisions          │
                    │  • Rail Performance       │
                    └───────────────────────────┘
```

## 🛠️ MCP Server Features

### 📊 **Resources (Data Access)**
- `pdr://intents` - All payment intents
- `pdr://intents/pending` - Pending intents only
- `pdr://rails` - Rail configurations
- `pdr://rails/active` - Active rails only
- `pdr://decisions` - PDR decisions
- `pdr://acc-decisions` - ACC compliance decisions
- `pdr://performance` - Rail performance data
- `pdr://analytics/dashboard` - Real-time analytics

### 🔧 **Tools (Operations)**

#### Intent Management
- `get_intent` - Retrieve specific intent
- `create_intent` - Create new payment intent
- `update_intent_status` - Update processing status

#### PDR Operations
- `generate_pdr_decision` - Run scoring engine
- `get_pdr_decision` - Retrieve PDR decision
- `execute_rail_transaction` - Execute payment

#### ACC Integration
- `get_acc_decision` - Get compliance decision
- `create_acc_decision` - Save compliance result

#### Rail Management
- `get_rail_config` - Rail configuration
- `update_rail_limits` - Update daily limits
- `get_rail_performance` - Performance statistics

#### Analytics & System
- `get_transaction_analytics` - Transaction analytics
- `run_sql_query` - Custom SQL queries (read-only)
- `health_check` - System health
- `get_system_stats` - System statistics

## 🚀 Quick Start

### 1. Start MCP Server
```bash
cd /workspace/services/pdr
python mcp_server.py
```

### 2. Start All Services
```bash
python start_services.py
```

### 3. Run Integration Tests
```bash
python start_services.py --test
```

## 🔌 MCP Client Usage

### Basic Operations
```python
from mcp_client import MCPSession

# Generate PDR decision
async with MCPSession() as client:
    result = await client.generate_pdr_decision("TXN001")
    print(f"Primary rail: {result['pdr_decision']['primary_rail']}")

# Execute transaction
async with MCPSession() as client:
    result = await client.execute_rail_transaction("TXN001")
    print(f"Success: {result['execution_result']['success']}")

# Get analytics
async with MCPSession() as client:
    dashboard = await client.get_analytics_dashboard()
    print(f"Pending intents: {dashboard['pending_intents']}")
```

### Batch Processing
```python
async with MCPSession() as client:
    # Process up to 100 pending intents
    result = await client.process_pending_intents_batch(100)
    print(f"Processed: {result['processed']}")
    print(f"Successful: {result['successful']}")
```

### Rail Performance Analytics
```python
async with MCPSession() as client:
    # Get 30-day performance for IMPS
    stats = await client.get_rail_performance("IMPS", 30)
    print(f"Success rate: {stats['success_rate']:.1%}")
    print(f"Avg ETA: {stats['avg_eta_ms']}ms")
```

## 🌐 Service Integration

### PDR Service Endpoints
```bash
# MCP-powered endpoints
GET  /pdr/mcp/health              # MCP server health
GET  /pdr/mcp/analytics           # Analytics via MCP
POST /pdr/mcp/decision/{txn_id}   # Generate decision via MCP
POST /pdr/mcp/execute/{txn_id}    # Execute via MCP
GET  /pdr/mcp/rails/{rail}/performance  # Rail stats via MCP
POST /pdr/mcp/batch-process       # Batch processing via MCP
```

### ACC Service Endpoints
```bash
# Enhanced with MCP integration
POST /acc/decide                  # Enhanced with MCP persistence
GET  /acc/mcp/health             # MCP server health
GET  /acc/mcp/analytics          # Compliance analytics
GET  /acc/decision/{txn_id}      # Get ACC decision via MCP
GET  /acc/intent/{txn_id}        # Get intent details via MCP
```

## 📈 Enhanced Features

### 🧮 **Sophisticated Scoring with MCP**
```python
# Custom scoring weights via MCP
custom_weights = {
    "w_succ": 0.25,    # Higher success weight
    "w_cost": 0.20,    # Higher cost sensitivity
    "w_eta": 0.15,     # Speed importance
    "w_comp": 0.15,    # Compliance weight
    "w_risk": 0.10     # Risk tolerance
}

async with MCPSession() as client:
    result = await client.generate_pdr_decision(
        "TXN001", 
        custom_weights
    )
```

### 🛡️ **Enhanced ACC with Persistence**
- Automatic decision caching
- Compliance penalty calculation
- Risk score computation
- Evidence tracking
- Policy version management

### 📊 **Real-time Analytics**
- Rail performance tracking
- Success rate monitoring
- ETA analysis
- Cost optimization insights
- Compliance trends

### 🔄 **Batch Processing**
- Intelligent batching
- Parallel processing
- Error handling
- Progress tracking
- Rollback capabilities

## 🧪 Testing

### Comprehensive Test Suite
```bash
# Run all MCP integration tests
python test_mcp_integration.py

# Test specific components
python -c "
from test_mcp_integration import test_mcp_server_connection
import asyncio
asyncio.run(test_mcp_server_connection())
"
```

### Test Coverage
- ✅ MCP server connection
- ✅ Resource access (8 endpoints)
- ✅ Tool operations (20+ tools)
- ✅ Intent CRUD operations
- ✅ ACC integration
- ✅ PDR decision generation
- ✅ Rail execution
- ✅ Performance analytics
- ✅ Batch processing
- ✅ System health monitoring

## 🔧 Configuration

### Environment Variables
```bash
# Database connection
DATABASE_URL=postgresql://user:pass@host:port/db

# Service URLs
ACC_SERVICE_URL=http://localhost:8000

# MCP Configuration
MCP_ENV=production
MCP_LOG_LEVEL=INFO
MCP_TENANT_ID=default_tenant
```

### MCP Server Command
```bash
# Default MCP server startup
python /workspace/services/pdr/mcp_server.py

# Custom server configuration
MCPClient(server_command=["python", "custom_mcp_server.py"])
```

## 📋 API Examples

### 1. Complete Transaction Flow via MCP
```python
async def complete_transaction_flow(transaction_id: str):
    async with MCPSession() as client:
        # 1. Get intent details
        intent = await client.get_intent(transaction_id)
        
        # 2. Generate PDR decision
        pdr_result = await client.generate_pdr_decision(transaction_id)
        
        # 3. Execute transaction
        execution = await client.execute_rail_transaction(transaction_id)
        
        # 4. Get final status
        final_decision = await client.get_pdr_decision(transaction_id)
        
        return {
            "intent": intent,
            "decision": pdr_result,
            "execution": execution,
            "final_status": final_decision
        }
```

### 2. Analytics Dashboard via MCP
```python
async def get_comprehensive_analytics():
    async with MCPSession() as client:
        # System overview
        dashboard = await client.get_analytics_dashboard()
        
        # Rail performance
        rail_stats = {}
        for rail in ["UPI", "IMPS", "NEFT", "RTGS", "IFT"]:
            rail_stats[rail] = await client.get_rail_performance(rail)
        
        # System health
        health = await client.health_check()
        
        return {
            "dashboard": dashboard,
            "rail_performance": rail_stats,
            "system_health": health,
            "timestamp": datetime.now().isoformat()
        }
```

### 3. Batch Processing via MCP
```python
async def process_daily_batch():
    async with MCPSession() as client:
        # Process pending intents
        batch_result = await client.process_pending_intents_batch(1000)
        
        # Update rail limits based on usage
        for rail in ["UPI", "IMPS", "NEFT"]:
            performance = await client.get_rail_performance(rail, 1)
            # Calculate remaining limits...
            await client.update_rail_limits(rail, remaining_amount)
        
        return batch_result
```

## 🎯 Benefits

### For AI Agents
- **Structured Access**: Type-safe database operations
- **Rich Context**: Complete transaction history and analytics
- **Real-time Data**: Live performance metrics and health status
- **Batch Operations**: Efficient bulk processing capabilities

### For Developers
- **Simplified Integration**: Single MCP interface for all database operations
- **Consistent API**: Standardized tools and resources across services
- **Comprehensive Testing**: Full test coverage with realistic scenarios
- **Production Ready**: Error handling, logging, and monitoring

### For Operations
- **Centralized Monitoring**: Single point for system health and metrics
- **Audit Trail**: Complete transaction and decision history
- **Performance Insights**: Real-time rail performance and optimization
- **Scalable Architecture**: Async operations with connection pooling

---

**🚀 The MCP integration transforms the PDR system into a powerful, AI-accessible payment intelligence platform with sophisticated database operations, real-time analytics, and production-grade reliability.**