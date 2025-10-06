# services/crrak/crrak_logic.py
import json
import os
from pathlib import Path
from models import ACCDecision, Neo4jGraph, PDROutput, RCAResult, ReconciliationResult, RedisRecord
from typing import List, Dict, Optional
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Get the directory where this script is located
BASE_DIR = Path(__file__).resolve().parent

# Load JSON datasets with proper error handling
def load_json(filename: str):
    """Load JSON file from the current directory"""
    try:
        file_path = BASE_DIR / filename
        with open(file_path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Warning: {filename} not found at {file_path}")
        return [] if filename.endswith('.json') else {}
    except json.JSONDecodeError as e:
        print(f"Error parsing {filename}: {e}")
        return [] if filename.endswith('.json') else {}

# Load all datasets
try:
    acc_data = [ACCDecision(**x) for x in load_json("acc_decision.json")]
except Exception as e:
    print(f"Error loading ACC data: {e}")
    acc_data = []

try:
    neo4j_data = load_json("neo4j_graph.json")
except Exception as e:
    print(f"Error loading Neo4j data: {e}")
    neo4j_data = []

try:
    pdr_data = [PDROutput(**x) for x in load_json("pdr_outputs.json")]
except Exception as e:
    print(f"Error loading PDR data: {e}")
    pdr_data = []

try:
    rca_json = load_json("rca_reports.json")
    rca_data = [RCAResult(**x) for x in rca_json.get("rca_results", [])]
except Exception as e:
    print(f"Error loading RCA data: {e}")
    rca_data = []

try:
    recon_data = [ReconciliationResult(**x) for x in load_json("reconciliation_results.json")]
except Exception as e:
    print(f"Error loading Reconciliation data: {e}")
    recon_data = []

try:
    redis_data = [RedisRecord(**x) for x in load_json("redis.json")]
except Exception as e:
    print(f"Error loading Redis data: {e}")
    redis_data = []

# Helper to find line info
def find_line_info(line_id: str) -> Dict:
    """Find all information related to a specific line ID"""
    acc = next((x for x in acc_data if x.line_id == line_id), None)
    pdr = next((x for x in pdr_data if x.line_id == line_id), None)
    rca = next((x for x in rca_data if x.line_id == line_id), None)
    recon = next((x for x in recon_data if x.line_id == line_id), None)
    redis = next((x for x in redis_data if x.line_id == line_id), None)
    neo4j = next((x for x in neo4j_data if x.get("line_id") == line_id), None)
    
    return {
        "acc": acc,
        "pdr": pdr,
        "rca": rca,
        "recon": recon,
        "redis": redis,
        "neo4j": neo4j
    }

# Generate explanation via OpenAI
def generate_explanation(query: str, line_id: Optional[str] = None) -> str:
    """
    Generate a human-readable explanation using OpenAI based on the query.
    
    Args:
        query: The user's query
        line_id: Optional line ID to focus the explanation on
        
    Returns:
        str: AI-generated explanation
    """
    try:
        if line_id:
            data = find_line_info(line_id)
            
            # Check if we found any data for this line
            if not any(data.values()):
                return f"No data found for line {line_id}. Please verify the line ID and try again."
            
            prompt = f"""
AUDIT REQUEST: Line-Level Analysis for {line_id}

USER QUERY: {query}

=== DATA SOURCES ===

[ACC - Anti-Compliance Check Decision]
{data['acc'].dict() if data['acc'] else 'No ACC data available'}

[PDR - Payment Decision & Rail Selection]
{data['pdr'].dict() if data['pdr'] else 'No PDR data available'}

[RCA - Root Cause Analysis Report]
{data['rca'].dict() if data['rca'] else 'No RCA data available'}

[ARL - Automated Reconciliation & Ledger]
{data['recon'].dict() if data['recon'] else 'No reconciliation data available'}

[Redis - Real-Time Execution Timeline & System Health]
{data['redis'].dict() if data['redis'] else 'No Redis data available'}

[Neo4j - Transaction Execution Graph]
{data['neo4j'] if data['neo4j'] else 'No Neo4j graph available'}

=== AUDIT INSTRUCTIONS ===
Analyze the above data and provide a comprehensive audit report following the structured format defined in your system prompt. 
Focus on answering the user's specific query while maintaining audit rigor and completeness.
Correlate data across all systems to provide a complete picture of the transaction lifecycle.
"""
        else:
            # Batch-level or general query
            prompt = f"""
AUDIT REQUEST: Batch-Level or General Analysis

USER QUERY: {query}

=== AVAILABLE DATA SUMMARY ===
- ACC Decisions: {len(acc_data)} records
- PDR Outputs: {len(pdr_data)} records  
- RCA Reports: {len(rca_data)} records
- Reconciliation Results: {len(recon_data)} records
- Redis Records: {len(redis_data)} records
- Neo4j Graphs: {len(neo4j_data)} records

=== KEY METRICS ===
ACC Decisions:
{[{'line_id': x.line_id, 'decision': x.decision, 'reason': x.reason} for x in acc_data]}

PDR Status:
{[{'line_id': x.line_id, 'rail': x.rail_selected, 'status': x.status, 'amount': x.expected_amount} for x in pdr_data]}

RCA Summary:
{[{'line_id': x.line_id, 'root_cause': x.root_cause, 'category': x.failure_category, 'action': x.recommended_action} for x in rca_data]}

Reconciliation Summary:
{[{'line_id': x.line_id, 'match_status': x.match_status, 'match_reason': x.match_reason} for x in recon_data]}

=== AUDIT INSTRUCTIONS ===
Analyze the batch data and provide a comprehensive audit report. Identify patterns, trends, and systemic issues.
Present findings in the structured format with particular attention to:
- Overall batch health and success rate
- Common failure patterns
- System performance trends
- Compliance issues
- Financial impact
- Recommendations for improvement
"""
        
        # Professional audit system prompt
        system_prompt = """You are a Senior Financial Auditor and Root Cause Analysis Expert specializing in payment systems and transaction reconciliation.

Your responsibilities:
1. Provide thorough, evidence-based audit explanations
2. Analyze transaction failures with forensic precision
3. Connect data points across multiple systems (ACC, PDR, RCA, ARL, Redis, Neo4j)
4. Present findings in a clear, structured format suitable for audit reports

When analyzing transactions, you MUST:

**Structure your response as follows:**

## Executive Summary
- Provide a 2-3 sentence overview of the situation

## Transaction Details
- Line ID and Batch ID
- Transaction amount and currency
- UTR and PSP reference
- Timestamp and processing timeline

## Findings & Root Cause Analysis
Present your findings in numbered points:
1. **ACC Decision Analysis**: Explain the compliance decision and reasoning
2. **Payment Rail Selection**: Detail which rail was selected and why
3. **Execution Status**: Describe what happened during execution
4. **Reconciliation Outcome**: Explain matching status and any discrepancies
5. **System Health Context**: Note any system performance issues (CPU, memory, circuit breakers)
6. **Root Cause Identification**: Clearly state the primary cause of failure (if applicable)

## Evidence Trail
- Reference specific data points from each system
- Show the execution flow: ACC → PDR → ARL → RCA
- Highlight any anomalies or red flags

## Impact Assessment
- Financial impact (if applicable)
- Operational impact
- Compliance implications

## Recommendations
Provide specific, actionable recommendations:
1. Immediate actions required
2. Preventive measures
3. System improvements needed

## Audit Notes
- Any additional observations
- Related patterns or trends
- Follow-up items required

**Tone & Style:**
- Be precise and factual
- Use professional audit terminology
- Maintain objectivity
- Support all claims with evidence from the data
- Be concise but comprehensive
- Highlight critical issues clearly

**Data Interpretation Rules:**
- MATCHED = Successful reconciliation
- EXCEPTION = Discrepancy requiring investigation
- HOLD = Transaction flagged by compliance
- PASS = Cleared compliance checks
- Circuit breaker TRIPPED = System protection activated
- High CPU (>80%) = System under stress"""

        # Call OpenAI API with new client interface
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        return f"Error generating explanation: {str(e)}. Please check your OpenAI API key and try again."