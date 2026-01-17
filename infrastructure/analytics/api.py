#!/usr/bin/env python3
"""
DownStream Analytics API
Receives events from stream tracker, stores in SQLite.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
import sqlite3
import json
from datetime import datetime
import os
from pathlib import Path

app = FastAPI(title="DownStream Analytics API")

# CORS for stream domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production: restrict to *.vercel.app, *.downstream.ink
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type"],
)

# Database path - configurable via environment
DB_PATH = os.environ.get("DS_ANALYTICS_DB", "/var/lib/downstream/analytics.db")

# For local development
if not os.path.exists(os.path.dirname(DB_PATH)):
    DB_PATH = os.path.join(os.path.dirname(__file__), "analytics.db")


def get_db():
    """Get database connection with row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database from schema."""
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    if os.path.exists(schema_path):
        db = get_db()
        with open(schema_path, "r") as f:
            db.executescript(f.read())
        db.commit()
        db.close()


# Initialize on startup
@app.on_event("startup")
async def startup():
    init_db()


# ----- Models -----

class PageViewRequest(BaseModel):
    stream_id: str
    session_id: str
    visitor_id: str
    referrer: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    user_agent: Optional[str] = None
    device_type: Optional[str] = None
    screen_width: Optional[int] = None
    screen_height: Optional[int] = None


class AnalyticsEvent(BaseModel):
    type: str
    timestamp: str
    milestone: Optional[int] = None
    time_to_reach_ms: Optional[int] = None
    section_id: Optional[str] = None
    section_index: Optional[int] = None
    dwell_time_ms: Optional[int] = None
    total_time_ms: Optional[int] = None
    max_scroll_depth: Optional[int] = None
    # Engagement summary fields
    period: Optional[int] = None
    reversals: Optional[int] = None
    pause_points: Optional[List[dict]] = None
    exit_depth_pct: Optional[int] = None
    min_depth_pct: Optional[int] = None
    max_depth_pct: Optional[int] = None
    total_scroll_distance: Optional[int] = None
    section_revisits: Optional[dict] = None


class EventBatch(BaseModel):
    stream_id: str
    session_id: str
    visitor_id: str
    page_view_id: Optional[int] = None
    events: List[AnalyticsEvent]


class StreamRegistration(BaseModel):
    id: str
    title: str
    customer_email: Optional[str] = None
    deployment_url: str
    total_sections: Optional[int] = 0
    total_frames: Optional[int] = 0


# ----- Endpoints -----

@app.post("/pageview")
async def record_pageview(request: Request, data: PageViewRequest):
    """Record a page view and return the page_view_id."""
    # Get country from Cloudflare header if available
    country_code = request.headers.get("CF-IPCountry", None)

    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute("""
            INSERT INTO page_views
            (stream_id, session_id, visitor_id, started_at, referrer,
             utm_source, utm_medium, utm_campaign, user_agent,
             device_type, screen_width, screen_height, country_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.stream_id, data.session_id, data.visitor_id,
            datetime.utcnow().isoformat(), data.referrer,
            data.utm_source, data.utm_medium, data.utm_campaign,
            data.user_agent, data.device_type,
            data.screen_width, data.screen_height, country_code
        ))
        db.commit()
        page_view_id = cursor.lastrowid
        return {"status": "ok", "page_view_id": page_view_id}
    finally:
        db.close()


@app.post("/events")
async def record_events(data: EventBatch):
    """Record a batch of events."""
    if not data.page_view_id:
        return {"status": "ok", "message": "no page_view_id, events dropped"}

    db = get_db()
    cursor = db.cursor()

    try:
        for event in data.events:
            if event.type == "scroll_milestone":
                cursor.execute("""
                    INSERT INTO scroll_milestones
                    (page_view_id, milestone, reached_at, time_to_reach_ms)
                    VALUES (?, ?, ?, ?)
                """, (data.page_view_id, event.milestone,
                      event.timestamp, event.time_to_reach_ms))

            elif event.type == "section_enter":
                cursor.execute("""
                    INSERT INTO section_events
                    (page_view_id, section_id, section_index, entered_at)
                    VALUES (?, ?, ?, ?)
                """, (data.page_view_id, event.section_id,
                      event.section_index, event.timestamp))

            elif event.type == "section_exit":
                cursor.execute("""
                    UPDATE section_events
                    SET exited_at = ?, dwell_time_ms = ?
                    WHERE page_view_id = ? AND section_id = ?
                    AND exited_at IS NULL
                """, (event.timestamp, event.dwell_time_ms,
                      data.page_view_id, event.section_id))

            elif event.type == "page_exit":
                cursor.execute("""
                    UPDATE page_views
                    SET ended_at = ?
                    WHERE id = ?
                """, (event.timestamp, data.page_view_id))

            elif event.type == "engagement_summary":
                cursor.execute("""
                    INSERT INTO engagement_summaries
                    (page_view_id, period, recorded_at, reversals, pause_points,
                     exit_depth_pct, min_depth_pct, max_depth_pct,
                     total_scroll_distance, section_revisits)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    data.page_view_id,
                    event.period or 0,
                    event.timestamp,
                    event.reversals or 0,
                    json.dumps(event.pause_points) if event.pause_points else None,
                    event.exit_depth_pct,
                    event.min_depth_pct,
                    event.max_depth_pct,
                    event.total_scroll_distance or 0,
                    json.dumps(event.section_revisits) if event.section_revisits else None
                ))

        db.commit()
        return {"status": "ok", "events_processed": len(data.events)}
    finally:
        db.close()


@app.post("/streams/register")
async def register_stream(data: StreamRegistration):
    """Register a stream (called on deployment)."""
    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute("""
            INSERT OR REPLACE INTO streams
            (id, title, customer_email, deployed_at, deployment_url,
             total_sections, total_frames)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            data.id, data.title, data.customer_email,
            datetime.utcnow().isoformat(), data.deployment_url,
            data.total_sections, data.total_frames
        ))
        db.commit()
        return {"status": "ok", "stream_id": data.id}
    finally:
        db.close()


@app.get("/stats/{stream_id}")
async def get_stream_stats(stream_id: str, days: int = 7):
    """Get stats for a stream (used for internal dashboard and email API)."""
    db = get_db()
    cursor = db.cursor()

    try:
        # Overall stats
        cursor.execute("""
            SELECT
                COUNT(*) as total_views,
                COUNT(DISTINCT visitor_id) as unique_visitors,
                AVG(
                    CASE
                        WHEN ended_at IS NOT NULL
                        THEN (julianday(ended_at) - julianday(started_at)) * 86400
                        ELSE NULL
                    END
                ) as avg_time_seconds
            FROM page_views
            WHERE stream_id = ?
            AND started_at >= datetime('now', ?)
        """, (stream_id, f'-{days} days'))
        row = cursor.fetchone()
        overall = dict(row) if row else {}

        # Completion rate (reached 100% milestone)
        cursor.execute("""
            SELECT COUNT(DISTINCT pv.id) as completions
            FROM page_views pv
            JOIN scroll_milestones sm ON pv.id = sm.page_view_id
            WHERE pv.stream_id = ?
            AND sm.milestone = 100
            AND pv.started_at >= datetime('now', ?)
        """, (stream_id, f'-{days} days'))
        completions = cursor.fetchone()[0] or 0

        # Average scroll depth (max milestone per session)
        cursor.execute("""
            SELECT AVG(max_milestone) as avg_depth
            FROM (
                SELECT pv.id, MAX(sm.milestone) as max_milestone
                FROM page_views pv
                LEFT JOIN scroll_milestones sm ON pv.id = sm.page_view_id
                WHERE pv.stream_id = ?
                AND pv.started_at >= datetime('now', ?)
                GROUP BY pv.id
            )
        """, (stream_id, f'-{days} days'))
        avg_depth = cursor.fetchone()[0] or 0

        # Device split
        cursor.execute("""
            SELECT device_type, COUNT(*) as count
            FROM page_views
            WHERE stream_id = ?
            AND started_at >= datetime('now', ?)
            AND device_type IS NOT NULL
            GROUP BY device_type
        """, (stream_id, f'-{days} days'))
        devices = {row['device_type']: row['count'] for row in cursor.fetchall()}

        # Top referrers
        cursor.execute("""
            SELECT referrer, COUNT(*) as count
            FROM page_views
            WHERE stream_id = ?
            AND referrer IS NOT NULL
            AND referrer != ''
            AND started_at >= datetime('now', ?)
            GROUP BY referrer
            ORDER BY count DESC
            LIMIT 5
        """, (stream_id, f'-{days} days'))
        referrers = [{"source": row['referrer'], "count": row['count']}
                     for row in cursor.fetchall()]

        # Section engagement
        cursor.execute("""
            SELECT
                section_id,
                section_index,
                COUNT(*) as view_count,
                AVG(dwell_time_ms) as avg_dwell_ms
            FROM section_events
            WHERE page_view_id IN (
                SELECT id FROM page_views
                WHERE stream_id = ?
                AND started_at >= datetime('now', ?)
            )
            GROUP BY section_id, section_index
            ORDER BY section_index
        """, (stream_id, f'-{days} days'))
        sections = [dict(row) for row in cursor.fetchall()]

        # Geographic distribution
        cursor.execute("""
            SELECT country_code, COUNT(*) as count
            FROM page_views
            WHERE stream_id = ?
            AND country_code IS NOT NULL
            AND started_at >= datetime('now', ?)
            GROUP BY country_code
            ORDER BY count DESC
            LIMIT 10
        """, (stream_id, f'-{days} days'))
        countries = {row['country_code']: row['count'] for row in cursor.fetchall()}

        # Peak hours (UTC)
        cursor.execute("""
            SELECT
                strftime('%H', started_at) as hour,
                COUNT(*) as count
            FROM page_views
            WHERE stream_id = ?
            AND started_at >= datetime('now', ?)
            GROUP BY hour
            ORDER BY count DESC
        """, (stream_id, f'-{days} days'))
        peak_hours = {row['hour']: row['count'] for row in cursor.fetchall()}

        # Engagement metrics (from engagement_summaries)
        cursor.execute("""
            SELECT
                SUM(reversals) as total_reversals,
                AVG(reversals) as avg_reversals_per_session,
                SUM(total_scroll_distance) as total_scroll_distance,
                AVG(total_scroll_distance) as avg_scroll_distance
            FROM engagement_summaries
            WHERE page_view_id IN (
                SELECT id FROM page_views
                WHERE stream_id = ?
                AND started_at >= datetime('now', ?)
            )
        """, (stream_id, f'-{days} days'))
        engagement_row = cursor.fetchone()
        engagement_totals = dict(engagement_row) if engagement_row else {}

        # Top pause points (where people stop to watch/read)
        cursor.execute("""
            SELECT pause_points
            FROM engagement_summaries
            WHERE page_view_id IN (
                SELECT id FROM page_views
                WHERE stream_id = ?
                AND started_at >= datetime('now', ?)
            )
            AND pause_points IS NOT NULL
        """, (stream_id, f'-{days} days'))

        # Aggregate pause points by depth
        pause_depth_counts = {}
        for row in cursor.fetchall():
            if row['pause_points']:
                try:
                    pauses = json.loads(row['pause_points'])
                    for pause in pauses:
                        depth = pause.get('depth_pct', 0)
                        # Bucket into 10% ranges
                        bucket = (depth // 10) * 10
                        pause_depth_counts[bucket] = pause_depth_counts.get(bucket, 0) + 1
                except json.JSONDecodeError:
                    pass

        # Section revisits aggregation
        cursor.execute("""
            SELECT section_revisits
            FROM engagement_summaries
            WHERE page_view_id IN (
                SELECT id FROM page_views
                WHERE stream_id = ?
                AND started_at >= datetime('now', ?)
            )
            AND section_revisits IS NOT NULL
        """, (stream_id, f'-{days} days'))

        revisit_counts = {}
        for row in cursor.fetchall():
            if row['section_revisits']:
                try:
                    revisits = json.loads(row['section_revisits'])
                    for section_id, count in revisits.items():
                        revisit_counts[section_id] = revisit_counts.get(section_id, 0) + count
                except json.JSONDecodeError:
                    pass

        total_views = overall.get('total_views', 0) or 0

        return {
            "stream_id": stream_id,
            "period_days": days,
            "total_views": total_views,
            "unique_visitors": overall.get('unique_visitors', 0) or 0,
            "completion_rate": round(completions / total_views * 100, 1) if total_views > 0 else 0,
            "avg_scroll_depth": round(avg_depth, 1),
            "avg_time_seconds": round(overall.get('avg_time_seconds', 0) or 0, 1),
            "device_split": devices,
            "top_referrers": referrers,
            "section_engagement": sections,
            "countries": countries,
            "peak_hours_utc": peak_hours,
            "engagement": {
                "total_reversals": engagement_totals.get('total_reversals') or 0,
                "avg_reversals_per_session": round(engagement_totals.get('avg_reversals_per_session') or 0, 1),
                "total_scroll_distance": engagement_totals.get('total_scroll_distance') or 0,
                "avg_scroll_distance": round(engagement_totals.get('avg_scroll_distance') or 0, 0),
                "pause_points_by_depth": pause_depth_counts,
                "section_revisits": revisit_counts
            }
        }
    finally:
        db.close()


@app.get("/api/email-stats/{stream_id}")
async def get_email_stats(stream_id: str):
    """Stats formatted for weekly customer email."""
    stats = await get_stream_stats(stream_id, days=7)

    # Format reading time
    avg_seconds = stats.get("avg_time_seconds", 0)
    minutes = int(avg_seconds // 60)
    seconds = int(avg_seconds % 60)
    reading_time = f"{minutes}m {seconds}s" if minutes > 0 else f"{seconds}s"

    # Build insights
    insights = []
    if stats["top_referrers"]:
        insights.append(f"Most views from {stats['top_referrers'][0]['source']}")
    if stats["device_split"].get("mobile", 0):
        insights.append(f"{stats['device_split']['mobile']} mobile readers")
    if stats["countries"]:
        insights.append(f"Readers from {len(stats['countries'])} countries")

    # Find top section by dwell time
    top_section = None
    if stats["section_engagement"]:
        top_section = max(stats["section_engagement"],
                         key=lambda x: x.get("avg_dwell_ms", 0) or 0)

    return {
        "stream_id": stream_id,
        "period": "Last 7 days",
        "headline_stats": {
            "views": stats["total_views"],
            "unique_visitors": stats["unique_visitors"],
            "completion_rate": f"{stats['completion_rate']}%",
            "avg_reading_time": reading_time
        },
        "insights": [i for i in insights if i],
        "top_section": top_section["section_id"] if top_section else None
    }


@app.get("/dashboard/summary")
async def dashboard_summary(days: int = 7):
    """Internal dashboard: summary across all streams."""
    db = get_db()
    cursor = db.cursor()

    try:
        # Total across all streams
        cursor.execute("""
            SELECT
                COUNT(*) as total_views,
                COUNT(DISTINCT visitor_id) as unique_visitors,
                COUNT(DISTINCT stream_id) as active_streams
            FROM page_views
            WHERE started_at >= datetime('now', ?)
        """, (f'-{days} days',))
        row = cursor.fetchone()
        totals = dict(row) if row else {}

        # Overall completion rate
        cursor.execute("""
            SELECT
                COUNT(DISTINCT sm.page_view_id) as completions,
                COUNT(DISTINCT pv.id) as total
            FROM page_views pv
            LEFT JOIN scroll_milestones sm ON pv.id = sm.page_view_id AND sm.milestone = 100
            WHERE pv.started_at >= datetime('now', ?)
        """, (f'-{days} days',))
        comp_row = cursor.fetchone()
        completions = comp_row[0] or 0
        total = comp_row[1] or 0
        completion_rate = round(completions / total * 100, 1) if total > 0 else 0

        # Per-stream breakdown
        cursor.execute("""
            SELECT
                pv.stream_id,
                s.title,
                s.deployment_url,
                COUNT(*) as views,
                COUNT(DISTINCT pv.visitor_id) as unique_visitors
            FROM page_views pv
            LEFT JOIN streams s ON pv.stream_id = s.id
            WHERE pv.started_at >= datetime('now', ?)
            GROUP BY pv.stream_id
            ORDER BY views DESC
        """, (f'-{days} days',))
        streams = [dict(row) for row in cursor.fetchall()]

        # Recent activity (last 24h)
        cursor.execute("""
            SELECT COUNT(*) as views_24h
            FROM page_views
            WHERE started_at >= datetime('now', '-1 day')
        """)
        views_24h = cursor.fetchone()[0] or 0

        return {
            "period_days": days,
            "totals": {
                **totals,
                "completion_rate": completion_rate,
                "views_24h": views_24h
            },
            "streams": streams
        }
    finally:
        db.close()


# Serve dashboard HTML
@app.get("/dashboard")
async def serve_dashboard():
    """Serve the dashboard HTML."""
    dashboard_path = os.path.join(os.path.dirname(__file__), "dashboard.html")
    if os.path.exists(dashboard_path):
        return FileResponse(dashboard_path)
    return {"error": "Dashboard not found"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        db = get_db()
        db.execute("SELECT 1")
        db.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8082)
