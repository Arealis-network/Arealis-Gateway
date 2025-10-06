# services/crrak/main.py
from fastapi import FastAPI, HTTPException
from models import CRRAKQuery
from crrak_logic import generate_explanation
import re
import uvicorn

app = FastAPI(
    title="CRRAK Audit Agent",
    description="AI-powered Root Cause Analysis and Audit Explanation Service",
    version="1.0.0"
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "CRRAK Audit Agent",
        "status": "running",
        "endpoints": {
            "explain": "/explain",
            "health": "/health"
        }
    }

@app.get("/health")
async def health():
    """Detailed health check"""
    return {"status": "healthy", "service": "crrak"}

@app.post("/explain")
async def explain(query: CRRAKQuery):
    """
    Endpoint to query CRRAK and get explanation.
    
    Example request body:
    {
        "query": "Explain line L-2"
    }
    
    Returns:
    {
        "query": "Explain line L-2",
        "line_id": "L-2",
        "explanation": "..."
    }
    """
    try:
        user_query = query.query
        
        # Validate query
        if not user_query or not user_query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        # Extract line ID if present in query (e.g., L-1, L-2, etc.)
        match = re.search(r"L-\d+", user_query)
        line_id = match.group(0) if match else None
        
        # Generate explanation
        explanation = generate_explanation(user_query, line_id)
        
        return {
            "query": user_query,
            "line_id": line_id,
            "explanation": explanation,
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

if __name__ == "__main__":
    # Run the server when executed directly
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )