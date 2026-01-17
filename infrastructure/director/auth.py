"""
Authentication helpers for Director Dashboard
"""

import hashlib
import secrets
import sqlite3
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict
from fastapi import Request, HTTPException, Depends
from fastapi.responses import RedirectResponse


def hash_password(password: str) -> str:
    """Hash password using bcrypt (industry standard)."""
    salt = bcrypt.gensalt()
    hash_bytes = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hash_bytes.decode('utf-8')


def verify_password(password: str, stored_hash: str) -> bool:
    """
    Verify password against stored hash.
    Supports both bcrypt (new) and SHA256+salt (legacy) for migration.
    """
    # Check if it's a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    if stored_hash.startswith('$2'):
        try:
            return bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
        except Exception:
            return False

    # Legacy SHA256+salt format (salt$hash)
    try:
        salt, hash_val = stored_hash.split("$")
        return hashlib.sha256((salt + password).encode()).hexdigest() == hash_val
    except ValueError:
        return False


def create_session(user_id: int, db: sqlite3.Connection) -> str:
    """Create a new session token for user."""
    token = secrets.token_urlsafe(32)
    created = datetime.utcnow()
    expires = created + timedelta(days=7)

    db.execute(
        "INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
        (token, user_id, created.isoformat(), expires.isoformat())
    )
    db.commit()

    return token


def get_session_user(token: str, db: sqlite3.Connection) -> Optional[Dict]:
    """Get user from session token, if valid."""
    row = db.execute(
        """SELECT u.id, u.username, u.display_name, u.role
           FROM sessions s
           JOIN users u ON s.user_id = u.id
           WHERE s.token = ? AND s.expires_at > ?""",
        (token, datetime.utcnow().isoformat())
    ).fetchone()

    if row:
        return dict(row)
    return None


def delete_session(token: str, db: sqlite3.Connection):
    """Delete a session token."""
    db.execute("DELETE FROM sessions WHERE token = ?", (token,))
    db.commit()


def cleanup_expired_sessions(db: sqlite3.Connection):
    """Remove expired sessions from database."""
    db.execute("DELETE FROM sessions WHERE expires_at < ?",
               (datetime.utcnow().isoformat(),))
    db.commit()
