-- DownStream Analytics Schema
-- SQLite database for tracking stream engagement

-- Streams metadata (populated on deployment)
CREATE TABLE IF NOT EXISTS streams (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    customer_email TEXT,
    deployed_at TEXT NOT NULL,
    deployment_url TEXT NOT NULL,
    total_sections INTEGER DEFAULT 0,
    total_frames INTEGER DEFAULT 0
);

-- Page views (one per session)
CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stream_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    visitor_id TEXT,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    user_agent TEXT,
    device_type TEXT,
    screen_width INTEGER,
    screen_height INTEGER,
    country_code TEXT,
    FOREIGN KEY (stream_id) REFERENCES streams(id)
);

-- Scroll milestones (fired at 25%, 50%, 75%, 100%)
CREATE TABLE IF NOT EXISTS scroll_milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_view_id INTEGER NOT NULL,
    milestone INTEGER NOT NULL,
    reached_at TEXT NOT NULL,
    time_to_reach_ms INTEGER,
    FOREIGN KEY (page_view_id) REFERENCES page_views(id)
);

-- Section engagement (one per section viewed)
CREATE TABLE IF NOT EXISTS section_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_view_id INTEGER NOT NULL,
    section_id TEXT NOT NULL,
    section_index INTEGER NOT NULL,
    entered_at TEXT NOT NULL,
    exited_at TEXT,
    dwell_time_ms INTEGER,
    FOREIGN KEY (page_view_id) REFERENCES page_views(id)
);

-- Engagement summaries (periodic snapshots of scroll behavior)
CREATE TABLE IF NOT EXISTS engagement_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_view_id INTEGER NOT NULL,
    period INTEGER NOT NULL,  -- Which minute of the session (0, 1, 2...)
    recorded_at TEXT NOT NULL,
    reversals INTEGER DEFAULT 0,  -- Direction changes in scroll
    pause_points TEXT,  -- JSON array of {depth_pct, duration_ms}
    exit_depth_pct INTEGER,  -- Scroll depth at end of period
    min_depth_pct INTEGER,  -- Min scroll depth during period
    max_depth_pct INTEGER,  -- Max scroll depth during period
    total_scroll_distance INTEGER DEFAULT 0,  -- Total pixels scrolled
    section_revisits TEXT,  -- JSON object of {section_id: visit_count}
    FOREIGN KEY (page_view_id) REFERENCES page_views(id)
);

-- Aggregated daily stats (computed by cron job)
CREATE TABLE IF NOT EXISTS daily_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stream_id TEXT NOT NULL,
    date TEXT NOT NULL,
    total_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    completions INTEGER DEFAULT 0,
    avg_scroll_depth REAL DEFAULT 0,
    avg_time_on_page_ms INTEGER DEFAULT 0,
    mobile_views INTEGER DEFAULT 0,
    desktop_views INTEGER DEFAULT 0,
    UNIQUE(stream_id, date),
    FOREIGN KEY (stream_id) REFERENCES streams(id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_page_views_stream_id ON page_views(stream_id);
CREATE INDEX IF NOT EXISTS idx_page_views_started_at ON page_views(started_at);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_scroll_milestones_page_view ON scroll_milestones(page_view_id);
CREATE INDEX IF NOT EXISTS idx_section_events_page_view ON section_events(page_view_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_daily_stats_stream ON daily_stats(stream_id);
CREATE INDEX IF NOT EXISTS idx_engagement_summaries_page_view ON engagement_summaries(page_view_id);
