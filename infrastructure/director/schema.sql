-- DownStream Director Dashboard - Database Schema

-- User accounts
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    role TEXT DEFAULT 'director',
    created_at TEXT NOT NULL,
    last_login TEXT
);

-- Session tokens
CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Background tasks
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    stream_id TEXT NOT NULL,
    task_type TEXT NOT NULL,
    segment_id INTEGER,
    status TEXT DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    result_path TEXT,
    error_message TEXT,
    created_at TEXT NOT NULL,
    started_at TEXT,
    completed_at TEXT,
    created_by INTEGER,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Review decisions (audit trail)
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stream_id TEXT NOT NULL,
    segment_id INTEGER NOT NULL,
    asset_type TEXT NOT NULL,
    decision TEXT NOT NULL,
    notes TEXT,
    reviewed_by INTEGER,
    reviewed_at TEXT NOT NULL,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Claude-Director messages (real-time communication)
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stream_id TEXT,                          -- NULL for global messages
    job_id TEXT,                             -- Related job if applicable
    sender TEXT NOT NULL,                    -- 'claude' or 'director'
    message_type TEXT DEFAULT 'info',        -- 'info', 'suggestion', 'approval_request', 'response'
    content TEXT NOT NULL,                   -- The message text
    options TEXT,                            -- JSON array of options for approval requests
    response TEXT,                           -- Director's response (if applicable)
    responded_at TEXT,                       -- When director responded
    created_at TEXT NOT NULL,
    read_at TEXT                             -- When director read it
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_tasks_stream ON tasks(stream_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_reviews_stream ON reviews(stream_id);
CREATE INDEX IF NOT EXISTS idx_reviews_segment ON reviews(stream_id, segment_id);
CREATE INDEX IF NOT EXISTS idx_messages_stream ON messages(stream_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(read_at) WHERE read_at IS NULL;
