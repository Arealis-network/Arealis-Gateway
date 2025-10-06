import os
import asyncpg
import logging
from fastapi import FastAPI, Body
from openai import OpenAI
from datetime import datetime
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Environment variables
DATABASE_URL = os.getenv("DATABASE_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not DATABASE_URL or not OPENAI_API_KEY:
    logger.error("Environment variables DATABASE_URL or OPENAI_API_KEY are missing.")
    raise ValueError("Missing required environment variables.")

# Initialize OpenAI client and FastAPI
client = OpenAI(api_key=OPENAI_API_KEY)
app = FastAPI()

# Fetch data from DB
async def fetch_all_data(line_id):
    logger.info(f"Fetching data for line_id: {line_id}")
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        acc = await conn.fetchrow("SELECT * FROM acc_agent WHERE line_id = $1", line_id)
        pdr = await conn.fetchrow("SELECT * FROM pdr_table WHERE line_id = $1", line_id)
        arl = await conn.fetchrow("SELECT * FROM arl_table WHERE line_id = $1", line_id)  # Optional
        redis = await conn.fetchrow("SELECT * FROM redis_table WHERE line_id = $1", line_id)
        await conn.close()
        logger.info("Data fetched successfully.")
        return acc, pdr, arl, redis
    except Exception as e:
        logger.exception("Failed to fetch data from database.")
        raise

# Save RCA results to DB
async def save_rca_result(rca_dict):
    logger.info(f"Saving RCA result for rca_id: {rca_dict['rca_id']}")
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        await conn.execute("""
            INSERT INTO rca_table (rca_id, line_id, batch_id, root_cause, failure_category, recommended_action, evidence_refs, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        """,
        rca_dict["rca_id"],
        rca_dict["line_id"],
        rca_dict["batch_id"],
        rca_dict["root_cause"],
        rca_dict["failure_category"],
        rca_dict["recommended_action"],
        json.dumps(rca_dict["evidence_refs"]),
        datetime.fromisoformat(rca_dict["created_at"])  # <-- FIXED here
        )
        await conn.close()
        logger.info("RCA result saved successfully.")
    except Exception as e:
        logger.exception("Failed to save RCA result.")
        raise

# RCA endpoint
@app.post("/rca")
async def rca_agent(line_id: str = Body(...), query: str = Body(...)):
    logger.info(f"Received RCA request for line_id: {line_id}, query: {query}")
    
    try:
        acc, pdr, arl, redis = await fetch_all_data(line_id)
        if not all([acc, pdr]):
            logger.warning("Missing required records (acc_agent or pdr_table) in the database.")
            return {"error": "Required records (acc_agent and pdr_table) not found for given line_id."}
        
        # arl_table is optional - set to None if not found
        if arl is None:
            logger.info("No ARL data found for this line_id - proceeding without ARL analysis.")

        # Compose LLM prompt
        prompt = f"""
You are a Senior Payment Systems Root Cause Analysis Specialist with expertise in RBI guidelines and banking regulations. Analyze the provided transaction data and provide concrete, factual analysis based ONLY on the actual data provided.

ANALYSIS PRINCIPLES:
- Base conclusions ONLY on the actual data provided - no speculation or assumptions
- Provide concrete, factual root cause analysis
- Give concise, step-wise recommendations
- Ensure RBI compliance and professional standards
- Keep explanations clear and actionable

TRANSACTION DATA:
User Query: {query}

ACC Agent Decision: {dict(acc)}
Payment Data Record: {dict(pdr)}
AML/ARL Screening: {dict(arl) if arl else "No ARL data available"}
System Health Status: {dict(redis)}

ROOT CAUSE ANALYSIS REQUIREMENTS:
- Identify the EXACT failure reason from the provided data
- Explain the technical mechanism based on actual system responses
- Reference specific RBI guidelines that apply to this failure type
- Keep analysis factual and evidence-based
- Avoid speculation - only state what the data confirms

RECOMMENDED ACTION REQUIREMENTS:
- Provide step-wise, actionable recommendations
- Each step should be specific and measurable
- Include RBI compliance requirements where applicable
- Prioritize immediate actions first, then preventive measures
- Keep recommendations concise and professional
- Reference relevant RBI circulars/guidelines
- Include specific recommendations for:
  * BANK (if bank/system fault): Technical fixes, system improvements, process enhancements
  * SENDER (if sender fault): Customer education, account verification, documentation requirements
  * RECEIVER (if receiver fault): Beneficiary verification, account validation, compliance checks

Please provide your analysis in the following JSON format:
{{
  "rca_id": {acc['id']},
  "line_id": "{line_id}",
  "batch_id": "{pdr['batch_id']}",
  "root_cause": "Concrete, factual analysis based on the actual data provided. State the exact failure reason and technical mechanism. Reference specific RBI guidelines. Keep it concise and evidence-based.",
  "failure_category": "Technical|Regulatory|Operational|Risk-based",
  "recommended_action": "Step-wise recommendations in numbered format with fault attribution: 1) Immediate action, 2) System fix, 3) Process improvement, 4) Compliance measure, 5) Monitoring setup. Include specific recommendations for BANK/SENDER/RECEIVER based on fault attribution. Each step should be specific and actionable.",
  "evidence_refs": {{
    "acc_decision_reason": {acc['decision_reason']},
    "acc_evidence_ref": {acc['evidence_ref']},
    "arl_match_reason": "{arl['match_reason'] if arl else 'No ARL data available'}",
    "redis_system_health": {redis['system_health']}
  }},
  "created_at": "{datetime.utcnow().isoformat()}"
}}

CRITICAL INSTRUCTIONS:
1. ROOT_CAUSE: Must be factual and based ONLY on the provided data. No speculation or assumptions.
2. RECOMMENDED_ACTION: Must be step-wise, numbered, and actionable. Each step should be specific and measurable.
3. Keep both fields concise but comprehensive.
4. Ensure RBI compliance in all recommendations.
5. Use professional banking terminology.

IMPORTANT: Do not wrap JSON arrays or objects in quotes. Use the actual JSON values directly.
"""
        logger.debug(f"Prompt sent to LLM: {prompt}")

        # Send prompt to LLM
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a Root Cause Analysis agent."},
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )

        output_json = response.choices[0].message.content.strip()
        print(output_json)
        logger.debug(f"Raw LLM output: {output_json}")

        # Parse and validate output
        try:
            rca_result = json.loads(output_json)
            logger.info("Successfully parsed LLM response as JSON.")
        except Exception as e:
            logger.error(f"Failed to parse LLM response as JSON. Error: {e}")
            return {"error": "LLM did not return valid JSON.", "raw_output": output_json}

        # Convert complex objects to JSON strings for database storage
        if isinstance(rca_result.get('root_cause'), dict):
            rca_result['root_cause'] = json.dumps(rca_result['root_cause'])
        
        if isinstance(rca_result.get('recommended_action'), dict):
            rca_result['recommended_action'] = json.dumps(rca_result['recommended_action'])

        # Save to database
        await save_rca_result(rca_result)
        logger.info("RCA processing complete.")
        return rca_result

    except Exception as e:
        logger.exception("Unexpected error during RCA processing.")
        return {"error": "Internal server error."}
