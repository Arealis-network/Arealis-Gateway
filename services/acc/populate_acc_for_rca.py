#!/usr/bin/env python3
"""
Script to populate ACC agent table with data matching the line IDs from PDR, ARL, and Redis tables.
This ensures RCA service can find the required data for analysis.
"""

import os
import sys
import json
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL not found in environment variables")
    sys.exit(1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_existing_line_ids():
    """Get line IDs from PDR, ARL, and Redis tables"""
    db = SessionLocal()
    try:
        # Get line IDs from PDR table
        pdr_line_ids = db.execute(text("SELECT DISTINCT line_id FROM pdr_table")).fetchall()
        pdr_line_ids = [row[0] for row in pdr_line_ids]
        
        # Get line IDs from ARL table
        arl_line_ids = db.execute(text("SELECT DISTINCT line_id FROM arl_table")).fetchall()
        arl_line_ids = [row[0] for row in arl_line_ids]
        
        # Get line IDs from Redis table
        redis_line_ids = db.execute(text("SELECT DISTINCT line_id FROM redis_table")).fetchall()
        redis_line_ids = [row[0] for row in redis_line_ids]
        
        # Combine all unique line IDs
        all_line_ids = list(set(pdr_line_ids + arl_line_ids + redis_line_ids))
        
        print(f"📊 Found line IDs:")
        print(f"  - PDR table: {pdr_line_ids}")
        print(f"  - ARL table: {arl_line_ids}")
        print(f"  - Redis table: {redis_line_ids}")
        print(f"  - All unique: {all_line_ids}")
        
        return all_line_ids
        
    except Exception as e:
        print(f"❌ Error fetching line IDs: {e}")
        return []
    finally:
        db.close()

def check_existing_acc_data(line_ids):
    """Check which line IDs already have ACC agent data"""
    db = SessionLocal()
    try:
        existing_acc = db.execute(
            text("SELECT line_id FROM acc_agent WHERE line_id = ANY(:line_ids)"),
            {"line_ids": line_ids}
        ).fetchall()
        existing_line_ids = [row[0] for row in existing_acc]
        
        missing_line_ids = [lid for lid in line_ids if lid not in existing_line_ids]
        
        print(f"📋 ACC agent data status:")
        print(f"  - Existing: {existing_line_ids}")
        print(f"  - Missing: {missing_line_ids}")
        
        return missing_line_ids
        
    except Exception as e:
        print(f"❌ Error checking ACC data: {e}")
        return line_ids
    finally:
        db.close()

def create_acc_agent_data(line_id):
    """Create ACC agent data for a given line ID"""
    
    # Sample data based on the line ID patterns
    if line_id == "L-1":
        return {
            "line_id": "L-1",
            "beneficiary": "Alice Johnson",
            "ifsc": "HDFC0001234",
            "amount": 912001.78,
            "policy_version": "v1.0",
            "status": "PASS",
            "decision_reason": "Transaction approved - all compliance checks passed",
            "evidence_ref": "EVIDENCE-001",
            "created_at": datetime.now()
        }
    elif line_id == "L-2":
        return {
            "line_id": "L-2", 
            "beneficiary": "Bob Smith",
            "ifsc": "ICIC0005678",
            "amount": 540252.97,
            "policy_version": "v1.0",
            "status": "FAIL",
            "decision_reason": "Transaction failed - amount mismatch detected",
            "evidence_ref": "EVIDENCE-002",
            "created_at": datetime.now()
        }
    elif line_id == "L-3":
        return {
            "line_id": "L-3",
            "beneficiary": "Charlie Brown",
            "ifsc": "ICIC0005678",
            "amount": 534772.99,
            "policy_version": "v1.0",
            "status": "PASS",
            "decision_reason": "Transaction approved - beneficiary verification successful",
            "evidence_ref": "EVIDENCE-003",
            "created_at": datetime.now()
        }
    elif line_id == "L-4":
        return {
            "line_id": "L-4",
            "beneficiary": "Diana Prince",
            "ifsc": "SBIN0001234",
            "amount": 181322.89,
            "policy_version": "v1.0",
            "status": "PASS", 
            "decision_reason": "Transaction approved - all regulatory checks passed",
            "evidence_ref": "EVIDENCE-004",
            "created_at": datetime.now()
        }
    elif line_id == "L-5":
        return {
            "line_id": "L-5",
            "beneficiary": "Eve Wilson",
            "ifsc": "ICIC0005678",
            "amount": 238125.64,
            "policy_version": "v1.0",
            "status": "PASS",
            "decision_reason": "Transaction approved - sender verification completed",
            "evidence_ref": "EVIDENCE-005", 
            "created_at": datetime.now()
        }
    else:
        # Generic data for any other line IDs
        return {
            "line_id": line_id,
            "beneficiary": f"Beneficiary_{line_id}",
            "ifsc": "HDFC0001234",
            "amount": 100000.00,
            "policy_version": "v1.0",
            "status": "PASS",
            "decision_reason": f"Transaction approved for {line_id} - standard compliance checks passed",
            "evidence_ref": f"EVIDENCE-{line_id}",
            "created_at": datetime.now()
        }

def populate_missing_acc_data(missing_line_ids):
    """Populate ACC agent table with missing data"""
    if not missing_line_ids:
        print("✅ No missing ACC agent data to populate")
        return
        
    db = SessionLocal()
    try:
        for line_id in missing_line_ids:
            acc_data = create_acc_agent_data(line_id)
            
            # Insert into acc_agent table
            db.execute(text("""
                INSERT INTO acc_agent (line_id, beneficiary, ifsc, amount, policy_version, status, decision_reason, evidence_ref, created_at)
                VALUES (:line_id, :beneficiary, :ifsc, :amount, :policy_version, :status, :decision_reason, :evidence_ref, :created_at)
            """), acc_data)
            
            print(f"✅ Created ACC agent data for {line_id}")
        
        db.commit()
        print(f"🎉 Successfully populated ACC agent data for {len(missing_line_ids)} line IDs")
        
    except Exception as e:
        print(f"❌ Error populating ACC data: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    print("🚀 Populating ACC agent data for RCA service...")
    
    # Get all line IDs from PDR, ARL, and Redis tables
    all_line_ids = get_existing_line_ids()
    if not all_line_ids:
        print("❌ No line IDs found in PDR, ARL, or Redis tables")
        return
    
    # Check which line IDs are missing ACC agent data
    missing_line_ids = check_existing_acc_data(all_line_ids)
    
    # Populate missing ACC agent data
    populate_missing_acc_data(missing_line_ids)
    
    print("✅ ACC agent data population complete!")

if __name__ == "__main__":
    main()
