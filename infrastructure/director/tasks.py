"""
Background task queue for long-running generation operations
"""

import threading
import queue
import uuid
import sqlite3
import os
from datetime import datetime
from typing import Callable, Optional, Any
from pathlib import Path


# Global task queue
task_queue = queue.Queue()
active_tasks = {}


def get_db_path() -> str:
    """Get database path from environment or use default."""
    db_path = os.environ.get("DIRECTOR_DB_PATH")
    if not db_path or not os.path.exists(os.path.dirname(db_path)):
        # Fallback to local development path
        return str(Path(__file__).parent / "director.db")
    return db_path


def get_db() -> sqlite3.Connection:
    """Get database connection with row factory."""
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    return conn


def enqueue_task(
    stream_id: str,
    task_type: str,
    func: Callable,
    segment_id: Optional[int] = None,
    user_id: Optional[int] = None,
    *args,
    **kwargs
) -> str:
    """
    Enqueue a background task and return task ID.

    Args:
        stream_id: Stream identifier
        task_type: Type of task (keyframe, video, extract, deploy)
        func: Function to execute
        segment_id: Optional segment ID
        user_id: User who created the task
        *args, **kwargs: Arguments to pass to func

    Returns:
        Task ID
    """
    task_id = str(uuid.uuid4())
    created = datetime.utcnow().isoformat()

    # Save to database
    db = get_db()
    db.execute(
        """INSERT INTO tasks
           (id, stream_id, task_type, segment_id, status, created_at, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (task_id, stream_id, task_type, segment_id, "pending", created, user_id)
    )
    db.commit()
    db.close()

    # Add to queue
    task_queue.put({
        "id": task_id,
        "stream_id": stream_id,
        "task_type": task_type,
        "segment_id": segment_id,
        "func": func,
        "args": args,
        "kwargs": kwargs
    })

    return task_id


def get_task_status(task_id: str) -> Optional[dict]:
    """Get current status of a task."""
    db = get_db()
    row = db.execute(
        "SELECT * FROM tasks WHERE id = ?",
        (task_id,)
    ).fetchone()
    db.close()

    if row:
        return dict(row)
    return None


def get_stream_tasks(stream_id: str, limit: int = 50) -> list:
    """Get all tasks for a stream, most recent first."""
    db = get_db()
    rows = db.execute(
        """SELECT * FROM tasks
           WHERE stream_id = ?
           ORDER BY created_at DESC
           LIMIT ?""",
        (stream_id, limit)
    ).fetchall()
    db.close()

    return [dict(row) for row in rows]


def cancel_task(task_id: str) -> bool:
    """
    Cancel a task.
    - Pending tasks: Removed from queue and marked as cancelled
    - Running tasks: Marked as cancelled but will complete in background

    Returns True if task was cancelled, False if not found or already completed.
    """
    db = get_db()

    # Get current task status
    row = db.execute("SELECT status FROM tasks WHERE id = ?", (task_id,)).fetchone()
    if not row:
        db.close()
        return False

    status = row["status"]

    # Can only cancel pending or running tasks
    if status in ("completed", "failed", "cancelled"):
        db.close()
        return False

    # Mark as cancelled in database
    db.execute(
        "UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?",
        ("cancelled", datetime.utcnow().isoformat(), task_id)
    )
    db.commit()
    db.close()

    # Note: We can't truly stop a running task, but we mark it as cancelled
    # The task will complete in the background but UI shows it as cancelled

    return True


def worker_loop():
    """
    Background worker that processes tasks from the queue.
    Runs in a daemon thread.
    """
    while True:
        task = task_queue.get()
        if task is None:  # Poison pill to stop worker
            break

        task_id = task["id"]
        active_tasks[task_id] = task

        db = get_db()

        try:
            # Check if task was cancelled while in queue
            current_status = db.execute(
                "SELECT status FROM tasks WHERE id = ?", (task_id,)
            ).fetchone()
            if current_status and current_status["status"] == "cancelled":
                db.close()
                active_tasks.pop(task_id, None)
                task_queue.task_done()
                continue

            # Update status to running
            started = datetime.utcnow().isoformat()
            db.execute(
                "UPDATE tasks SET status = ?, started_at = ? WHERE id = ?",
                ("running", started, task_id)
            )
            db.commit()

            # Execute the task function
            result = task["func"](*task["args"], **task["kwargs"])

            # Update status to completed
            completed = datetime.utcnow().isoformat()
            result_path = str(result) if result else None
            db.execute(
                "UPDATE tasks SET status = ?, result_path = ?, completed_at = ? WHERE id = ?",
                ("completed", result_path, completed, task_id)
            )
            db.commit()

        except Exception as e:
            # Update status to failed
            completed = datetime.utcnow().isoformat()
            error_msg = str(e)
            db.execute(
                "UPDATE tasks SET status = ?, error_message = ?, completed_at = ? WHERE id = ?",
                ("failed", error_msg, completed, task_id)
            )
            db.commit()

        finally:
            db.close()
            active_tasks.pop(task_id, None)
            task_queue.task_done()


# Start worker thread on module import
worker_thread = threading.Thread(target=worker_loop, daemon=True)
worker_thread.start()
