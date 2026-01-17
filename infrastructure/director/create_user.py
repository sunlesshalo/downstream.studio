#!/usr/bin/env python3
"""
Create a user account for the Director Dashboard
Usage: python create_user.py <username> <password> <display_name>
"""

import sys
import sqlite3
from datetime import datetime
from pathlib import Path

# Add parent directory to path to import auth module
sys.path.insert(0, str(Path(__file__).parent))

from auth import hash_password
from tasks import get_db_path, get_db


def create_user(username: str, password: str, display_name: str = None):
    """Create a new user account."""
    db = get_db()

    # Check if user already exists
    existing = db.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
    if existing:
        print(f"Error: User '{username}' already exists")
        return False

    # Create user
    password_hash = hash_password(password)
    created_at = datetime.utcnow().isoformat()

    db.execute(
        "INSERT INTO users (username, password_hash, display_name, created_at) VALUES (?, ?, ?, ?)",
        (username, password_hash, display_name or username, created_at)
    )
    db.commit()
    db.close()

    print(f"✓ User '{username}' created successfully")
    print(f"  Display name: {display_name or username}")
    print(f"  Database: {get_db_path()}")
    return True


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python create_user.py <username> <password> [display_name]")
        print("\nExample:")
        print('  python create_user.py artistic_director SecurePass123 "Artistic Director"')
        sys.exit(1)

    username = sys.argv[1]
    password = sys.argv[2]
    display_name = sys.argv[3] if len(sys.argv) > 3 else None

    # Initialize database first
    schema_path = Path(__file__).parent / "schema.sql"
    if schema_path.exists():
        db = get_db()
        with open(schema_path) as f:
            db.executescript(f.read())
        db.commit()
        db.close()

    create_user(username, password, display_name)
