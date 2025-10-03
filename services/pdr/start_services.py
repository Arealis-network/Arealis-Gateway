"""
Service Startup Script
Starts MCP server, PDR service, and ACC service in the correct order.
"""

import asyncio
import subprocess
import time
import sys
import os
from pathlib import Path

# Service configurations
SERVICES = {
    "mcp_server": {
        "command": [sys.executable, "/workspace/services/pdr/mcp_server.py"],
        "port": None,
        "health_url": None,
        "description": "MCP Database Server"
    },
    "pdr_service": {
        "command": [sys.executable, "/workspace/services/pdr/main.py"],
        "port": 8001,
        "health_url": "http://localhost:8001/health",
        "description": "PDR Agent Service"
    },
    "acc_service": {
        "command": [sys.executable, "/workspace/services/acc/main.py"],
        "port": 8000,
        "health_url": "http://localhost:8000",
        "description": "ACC Agent Service"
    }
}


class ServiceManager:
    """Manages multiple services with proper startup order"""
    
    def __init__(self):
        self.processes = {}
        self.running = False
    
    async def start_service(self, service_name: str, config: dict):
        """Start a single service"""
        print(f"🚀 Starting {config['description']}...")
        
        try:
            # Change to service directory
            if service_name == "acc_service":
                cwd = "/workspace/services/acc"
            else:
                cwd = "/workspace/services/pdr"
            
            # Start the process
            process = subprocess.Popen(
                config["command"],
                cwd=cwd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            self.processes[service_name] = process
            
            # Wait a moment for startup
            await asyncio.sleep(2)
            
            # Check if process is still running
            if process.poll() is None:
                print(f"✅ {config['description']} started (PID: {process.pid})")
                
                # Wait for health check if applicable
                if config.get("health_url"):
                    await self.wait_for_health(service_name, config)
                
                return True
            else:
                stdout, stderr = process.communicate()
                print(f"❌ {config['description']} failed to start")
                print(f"   stdout: {stdout[:200]}...")
                print(f"   stderr: {stderr[:200]}...")
                return False
                
        except Exception as e:
            print(f"❌ Error starting {config['description']}: {e}")
            return False
    
    async def wait_for_health(self, service_name: str, config: dict, timeout: int = 30):
        """Wait for service health check"""
        import requests
        
        health_url = config["health_url"]
        print(f"⏳ Waiting for {config['description']} health check...")
        
        for attempt in range(timeout):
            try:
                response = requests.get(health_url, timeout=2)
                if response.status_code == 200:
                    print(f"✅ {config['description']} is healthy")
                    return True
            except requests.exceptions.RequestException:
                pass
            
            await asyncio.sleep(1)
        
        print(f"⚠️ {config['description']} health check timeout")
        return False
    
    async def start_all_services(self):
        """Start all services in order"""
        print("🏗️ Starting Arealis Gateway Services")
        print("=" * 50)
        
        # Start services in dependency order
        service_order = ["mcp_server", "acc_service", "pdr_service"]
        
        for service_name in service_order:
            config = SERVICES[service_name]
            success = await self.start_service(service_name, config)
            
            if not success:
                print(f"💥 Failed to start {service_name}, stopping...")
                await self.stop_all_services()
                return False
        
        self.running = True
        print("\n🎉 All services started successfully!")
        print("\nService URLs:")
        print("  • ACC Service: http://localhost:8000")
        print("  • PDR Service: http://localhost:8001")
        print("  • MCP Server: Running in background")
        
        return True
    
    async def stop_all_services(self):
        """Stop all running services"""
        print("\n🛑 Stopping services...")
        
        for service_name, process in self.processes.items():
            if process and process.poll() is None:
                print(f"   Stopping {SERVICES[service_name]['description']}...")
                process.terminate()
                
                # Wait for graceful shutdown
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    print(f"   Force killing {service_name}...")
                    process.kill()
        
        self.processes.clear()
        self.running = False
        print("✅ All services stopped")
    
    async def monitor_services(self):
        """Monitor running services"""
        print("\n👀 Monitoring services (Ctrl+C to stop)...")
        
        try:
            while self.running:
                # Check if any process has died
                for service_name, process in list(self.processes.items()):
                    if process.poll() is not None:
                        print(f"💀 {SERVICES[service_name]['description']} has stopped")
                        self.running = False
                        break
                
                await asyncio.sleep(5)
                
        except KeyboardInterrupt:
            print("\n📡 Received shutdown signal...")
        
        await self.stop_all_services()
    
    async def run_tests(self):
        """Run integration tests"""
        print("\n🧪 Running Integration Tests")
        print("=" * 30)
        
        # Test MCP integration
        try:
            from test_mcp_integration import run_comprehensive_mcp_test
            await run_comprehensive_mcp_test()
        except Exception as e:
            print(f"❌ MCP integration test failed: {e}")
        
        # Test PDR pipeline
        try:
            from test_pdr import test_complete_pipeline
            await test_complete_pipeline()
        except Exception as e:
            print(f"❌ PDR pipeline test failed: {e}")


async def main():
    """Main startup function"""
    manager = ServiceManager()
    
    try:
        # Start all services
        success = await manager.start_all_services()
        
        if not success:
            return
        
        # Run tests if requested
        if "--test" in sys.argv:
            await manager.run_tests()
            return
        
        # Monitor services
        await manager.monitor_services()
        
    except Exception as e:
        print(f"💥 Startup error: {e}")
        await manager.stop_all_services()


def setup_environment():
    """Setup environment variables and dependencies"""
    print("🔧 Setting up environment...")
    
    # Set environment variables
    os.environ.setdefault("DATABASE_URL", 
        "postgresql://postgres:NmxNfLIKzWQzxwrmQUiKCouDXhcScjcD@switchyard.proxy.rlwy.net:25675/railway")
    os.environ.setdefault("ACC_SERVICE_URL", "http://localhost:8000")
    
    # Add Python paths
    pdr_path = Path("/workspace/services/pdr")
    acc_path = Path("/workspace/services/acc")
    
    if str(pdr_path) not in sys.path:
        sys.path.append(str(pdr_path))
    if str(acc_path) not in sys.path:
        sys.path.append(str(acc_path))
    
    print("✅ Environment setup complete")


if __name__ == "__main__":
    print("🚀 Arealis Gateway Service Manager")
    print("=" * 50)
    
    # Setup environment
    setup_environment()
    
    # Show usage
    if "--help" in sys.argv:
        print("Usage:")
        print("  python start_services.py          # Start all services")
        print("  python start_services.py --test   # Start services and run tests")
        print("  python start_services.py --help   # Show this help")
        sys.exit(0)
    
    # Run main
    asyncio.run(main())