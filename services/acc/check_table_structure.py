#!/usr/bin/env python3
"""Check the structure of acc_agent table"""

from database import *
from sqlalchemy import inspect

def check_table_structure():
    engine = create_engine('postgresql://postgres:NmxNfLIKzWQzxwrmQUiKCouDXhcScjcD@switchyard.proxy.rlwy.net:25675/railway')
    inspector = inspect(engine)
    
    print("ACC Agent table columns:")
    columns = inspector.get_columns('acc_agent')
    for col in columns:
        print(f"  - {col['name']}: {col['type']}")

if __name__ == "__main__":
    check_table_structure()
