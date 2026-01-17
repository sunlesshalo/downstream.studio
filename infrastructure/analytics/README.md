# DownStream Analytics

Custom analytics system for tracking stream engagement.

## Components

- **api.py** - FastAPI server (port 8082)
- **tracker.js** - Client-side tracking snippet (injected into streams)
- **dashboard.html** - Internal analytics dashboard
- **schema.sql** - SQLite database schema

## Quick Start

```bash
# Start the analytics API
./start_analytics.sh

# Or as daemon
./start_analytics.sh --daemon
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/pageview` | POST | Record page view, returns page_view_id |
| `/events` | POST | Batch event ingestion |
| `/stats/{stream_id}` | GET | Get stream stats (query: ?days=7) |
| `/api/email-stats/{stream_id}` | GET | Stats formatted for customer email |
| `/dashboard/summary` | GET | Summary across all streams |
| `/dashboard` | GET | Serve dashboard HTML |
| `/streams/register` | POST | Register stream on deployment |
| `/health` | GET | Health check |

## Metrics Tracked

**Per session:**
- Page view (referrer, UTM params, device, location)
- Scroll milestones (25%, 50%, 75%, 100%)
- Section enter/exit with dwell time
- Total time on page

**Aggregated:**
- Total views / unique visitors
- Completion rate
- Average scroll depth
- Device split (mobile/desktop)
- Geographic distribution
- Peak reading hours
- Section-by-section engagement

## Configuration

Environment variables:

```bash
DS_ANALYTICS_DB=/var/lib/downstream/analytics.db
DS_ANALYTICS_ENDPOINT=https://analytics.downstream.ink
ANALYTICS_API=http://localhost:8082
```

## Integration

### Stream Generation

The tracker is automatically injected into generated streams via `generate_app.py`. It reads `tracker.js` and injects it into `layout.tsx` with the stream ID and endpoint configured.

### Deployment

On stream deployment, `deploy_stream.sh` registers the stream with the analytics API (if available).

### Weekly Emails

`send_weekly_stats.sh` runs every Monday at 9:00 UTC and creates email jobs for each stream with customer data.

## Dashboard

Access at: `https://analytics.downstream.ink/dashboard`

Features:
- Summary cards (views, unique visitors, completion rate)
- Per-stream breakdown
- Period selection (24h, 7d, 30d)
- Auto-refresh every 60s

## Database

SQLite database at `/var/lib/downstream/analytics.db`

Tables:
- `streams` - Metadata for registered streams
- `page_views` - One row per session
- `scroll_milestones` - 25/50/75/100% events
- `section_events` - Section enter/exit tracking
- `daily_stats` - Aggregated daily metrics (for faster queries)
