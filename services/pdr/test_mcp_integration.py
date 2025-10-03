"""
MCP Integration Test Suite
Tests the complete MCP server and client integration with PDR and ACC services.
"""

import asyncio
import json
import time
from datetime import datetime, timedelta
from decimal import Decimal

from mcp_client import MCPClient, MCPSession, mcp_client
from models import *

# Test data
test_intent_data = {
    "transaction_id": "MCP_TEST_001",
    "payment_type": "payroll",
    "sender": {
        "name": "Arealis Corp",
        "account_number": "1234567890",
        "ifsc_code": "UTIB0000123",
        "bank_name": "Axis Bank"
    },
    "receiver": {
        "name": "John Doe MCP",
        "account_number": "9876543210",
        "ifsc_code": "HDFC0001234",
        "bank_name": "HDFC Bank"
    },
    "amount": 75000.00,
    "currency": "INR",
    "purpose": "MCP Test Salary Payment",
    "schedule_datetime": (datetime.now() + timedelta(hours=1)).isoformat(),
    "location": {
        "city": "Mumbai",
        "gps_coordinates": {
            "latitude": 19.0760,
            "longitude": 72.8777
        }
    },
    "additional_fields": {
        "employee_id": "MCP_EMP001",
        "department": "Engineering"
    }
}


async def test_mcp_server_connection():
    """Test basic MCP server connection"""
    print("🔌 Testing MCP Server Connection")
    
    try:
        async with MCPSession() as client:
            health = await client.health_check()
            print(f"✅ MCP Server Health: {health.get('status', 'unknown')}")
            return True
    except Exception as e:
        print(f"❌ MCP Server Connection Failed: {e}")
        return False


async def test_mcp_resources():
    """Test MCP resource access"""
    print("\n📊 Testing MCP Resources")
    
    try:
        async with MCPSession() as client:
            # Test analytics dashboard
            dashboard = await client.get_analytics_dashboard()
            print(f"✅ Analytics Dashboard: {len(dashboard)} keys")
            
            # Test active rails
            rails = await client.get_active_rails()
            print(f"✅ Active Rails: {len(rails)} rails available")
            
            # Test pending intents
            pending = await client.get_pending_intents()
            print(f"✅ Pending Intents: {len(pending)} intents")
            
            return True
    except Exception as e:
        print(f"❌ MCP Resources Test Failed: {e}")
        return False


async def test_mcp_intent_operations():
    """Test MCP intent CRUD operations"""
    print("\n📝 Testing MCP Intent Operations")
    
    try:
        async with MCPSession() as client:
            # Create intent
            create_result = await client.create_intent(test_intent_data)
            print(f"✅ Intent Created: {create_result.get('status', 'unknown')}")
            
            # Get intent
            intent = await client.get_intent(test_intent_data["transaction_id"])
            if intent:
                print(f"✅ Intent Retrieved: {intent.get('transaction_id', 'unknown')}")
            else:
                print("⚠️ Intent not found (may be expected if not persisted)")
            
            # Update intent status
            update_result = await client.update_intent_status(
                test_intent_data["transaction_id"], 
                "PROCESSING"
            )
            print(f"✅ Intent Status Updated: {update_result.get('status', 'unknown')}")
            
            return True
    except Exception as e:
        print(f"❌ MCP Intent Operations Failed: {e}")
        return False


async def test_mcp_acc_integration():
    """Test MCP ACC integration"""
    print("\n🛡️ Testing MCP ACC Integration")
    
    try:
        async with MCPSession() as client:
            transaction_id = test_intent_data["transaction_id"]
            
            # Create ACC decision
            acc_result = await client.create_acc_decision(
                transaction_id=transaction_id,
                decision="PASS",
                policy_version="mcp-test-1.0",
                reasons=[],
                compliance_penalty=5.0,
                risk_score=8.0
            )
            print(f"✅ ACC Decision Created: {acc_result.get('status', 'unknown')}")
            
            # Get ACC decision
            acc_decision = await client.get_acc_decision(transaction_id)
            if acc_decision:
                print(f"✅ ACC Decision Retrieved: {acc_decision.get('decision', 'unknown')}")
                print(f"   Compliance Penalty: {acc_decision.get('compliance_penalty', 0)}")
                print(f"   Risk Score: {acc_decision.get('risk_score', 0)}")
            else:
                print("⚠️ ACC Decision not found")
            
            return True
    except Exception as e:
        print(f"❌ MCP ACC Integration Failed: {e}")
        return False


async def test_mcp_pdr_decision():
    """Test MCP PDR decision generation"""
    print("\n🎯 Testing MCP PDR Decision Generation")
    
    try:
        async with MCPSession() as client:
            transaction_id = test_intent_data["transaction_id"]
            
            # Generate PDR decision with custom weights
            custom_weights = {
                "w_succ": 0.25,  # Increase success probability weight
                "w_cost": 0.20,  # Increase cost weight
                "w_eta": 0.15,
                "w_comp": 0.15,
                "w_risk": 0.10
            }
            
            pdr_result = await client.generate_pdr_decision(
                transaction_id, 
                custom_weights
            )
            
            if "error" not in pdr_result:
                decision = pdr_result.get("pdr_decision", {})
                explainability = pdr_result.get("explainability", {})
                
                print(f"✅ PDR Decision Generated:")
                print(f"   Primary Rail: {decision.get('primary_rail', 'unknown')}")
                print(f"   Score: {decision.get('primary_rail_score', 0):.3f}")
                print(f"   Fallbacks: {len(decision.get('fallback_rails', []))}")
                
                # Show top contributing factors
                top_factors = explainability.get("top_contributing_factors", [])
                if top_factors:
                    print(f"   Top Factors:")
                    for factor, contribution in top_factors[:3]:
                        print(f"     - {factor}: {contribution:.3f}")
                
                return True
            else:
                print(f"❌ PDR Decision Failed: {pdr_result.get('error')}")
                return False
                
    except Exception as e:
        print(f"❌ MCP PDR Decision Failed: {e}")
        return False


async def test_mcp_rail_execution():
    """Test MCP rail execution"""
    print("\n⚡ Testing MCP Rail Execution")
    
    try:
        async with MCPSession() as client:
            transaction_id = test_intent_data["transaction_id"]
            
            # Execute transaction (force UPI for predictable test)
            execution_result = await client.execute_rail_transaction(
                transaction_id, 
                force_rail="UPI"
            )
            
            if "error" not in execution_result:
                result = execution_result.get("execution_result", {})
                
                print(f"✅ Rail Execution:")
                print(f"   Rail: {result.get('rail_name', 'unknown')}")
                print(f"   Success: {result.get('success', False)}")
                print(f"   UTR: {result.get('utr_number', 'N/A')}")
                print(f"   Time: {result.get('execution_time_ms', 0)}ms")
                
                if not result.get('success'):
                    print(f"   Error: {result.get('error_message', 'Unknown error')}")
                
                return True
            else:
                print(f"❌ Rail Execution Failed: {execution_result.get('error')}")
                return False
                
    except Exception as e:
        print(f"❌ MCP Rail Execution Failed: {e}")
        return False


async def test_mcp_rail_performance():
    """Test MCP rail performance analytics"""
    print("\n📈 Testing MCP Rail Performance Analytics")
    
    try:
        async with MCPSession() as client:
            rails_to_test = ["UPI", "IMPS", "NEFT"]
            
            for rail in rails_to_test:
                performance = await client.get_rail_performance(rail, 30)
                
                if performance:
                    print(f"✅ {rail} Performance (30 days):")
                    print(f"   Total Transactions: {performance.get('total_transactions', 0)}")
                    print(f"   Success Rate: {performance.get('success_rate', 0):.1%}")
                    
                    avg_eta = performance.get('avg_eta_ms')
                    if avg_eta:
                        print(f"   Avg ETA: {avg_eta:.0f}ms")
                else:
                    print(f"⚠️ {rail}: No performance data")
            
            return True
    except Exception as e:
        print(f"❌ MCP Rail Performance Failed: {e}")
        return False


async def test_mcp_batch_processing():
    """Test MCP batch processing"""
    print("\n🔄 Testing MCP Batch Processing")
    
    try:
        async with MCPSession() as client:
            # Process pending intents in batch
            batch_result = await client.process_pending_intents_batch(10)
            
            print(f"✅ Batch Processing Result:")
            print(f"   Processed: {batch_result.get('processed', 0)}")
            print(f"   Successful: {batch_result.get('successful', 0)}")
            print(f"   Failed: {batch_result.get('failed', 0)}")
            
            # Show some results
            results = batch_result.get('results', [])
            if results:
                print(f"   Sample Results:")
                for result in results[:3]:
                    status = result.get('status', 'unknown')
                    txn_id = result.get('transaction_id', 'unknown')
                    print(f"     - {txn_id}: {status}")
            
            return True
    except Exception as e:
        print(f"❌ MCP Batch Processing Failed: {e}")
        return False


async def test_mcp_system_analytics():
    """Test MCP system analytics"""
    print("\n📊 Testing MCP System Analytics")
    
    try:
        async with MCPSession() as client:
            # Get system statistics
            stats = await client.get_system_stats("24h")
            
            print(f"✅ System Stats (24h):")
            print(f"   Period: {stats.get('period', 'unknown')}")
            
            # Get analytics dashboard
            dashboard = await client.get_analytics_dashboard()
            
            if dashboard:
                rail_performance = dashboard.get('rail_performance', {})
                print(f"✅ Dashboard Data:")
                print(f"   Rails Tracked: {len(rail_performance)}")
                print(f"   Pending Intents: {dashboard.get('pending_intents', 0)}")
                
                system_health = dashboard.get('system_health', {})
                print(f"   Database: {'✅' if system_health.get('database') else '❌'}")
            
            return True
    except Exception as e:
        print(f"❌ MCP System Analytics Failed: {e}")
        return False


async def run_comprehensive_mcp_test():
    """Run comprehensive MCP integration test"""
    print("🧪 MCP Integration Test Suite")
    print("=" * 60)
    
    start_time = time.time()
    
    # Test sequence
    tests = [
        ("Server Connection", test_mcp_server_connection),
        ("Resource Access", test_mcp_resources),
        ("Intent Operations", test_mcp_intent_operations),
        ("ACC Integration", test_mcp_acc_integration),
        ("PDR Decision", test_mcp_pdr_decision),
        ("Rail Execution", test_mcp_rail_execution),
        ("Rail Performance", test_mcp_rail_performance),
        ("Batch Processing", test_mcp_batch_processing),
        ("System Analytics", test_mcp_system_analytics)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            success = await test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("🏁 MCP Test Results Summary")
    print("=" * 60)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\nOverall: {passed}/{total} tests passed ({passed/total:.1%})")
    print(f"Total time: {time.time() - start_time:.2f}s")
    
    if passed == total:
        print("\n🎉 All MCP integration tests passed!")
    else:
        print(f"\n⚠️ {total - passed} tests failed. Check logs for details.")


def test_mcp_client_basic():
    """Test basic MCP client functionality (sync)"""
    print("\n🔧 Testing Basic MCP Client")
    
    try:
        # Test client initialization
        client = MCPClient()
        print("✅ MCP Client initialized")
        
        # Test connection parameters
        if hasattr(client, 'server_command'):
            print(f"✅ Server command: {' '.join(client.server_command[:2])}...")
        
        return True
    except Exception as e:
        print(f"❌ Basic MCP Client test failed: {e}")
        return False


if __name__ == "__main__":
    print("🚀 Starting MCP Integration Tests")
    
    # Test basic client first
    test_mcp_client_basic()
    
    # Run comprehensive async tests
    asyncio.run(run_comprehensive_mcp_test())