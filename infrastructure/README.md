# Infrastructure

How Claude Code operates DownStream on Hetzner.

## Architecture

```
[Customer pays + fills form]
        ↓
[Stripe webhook creates job file]
        ↓
jobs/pending/{stream-id}.json
        ↓
[Cron every 5 min: process_jobs.sh]
        ↓
[Claude Code: create production.json, generate content]
        ↓
jobs/review/{stream-id}.json
        ↓
[Cron every 15 min: review_streams.sh]
        ↓
[Claude Code: review quality, decide approve/regenerate/fail]
        ↓
[If approved: deploy to Vercel, email customer]
        ↓
jobs/completed/{stream-id}.json
```

## Directory Structure

```
infrastructure/
├── jobs/
│   ├── pending/      ← New orders land here
│   ├── processing/   ← Currently being processed
│   ├── review/       ← Awaiting quality review
│   ├── completed/    ← Successfully delivered
│   └── failed/       ← Errors (investigate during daily review)
├── triggers/         ← Trigger files for scheduled reviews
├── process_jobs.sh   ← Process new orders
├── review_streams.sh ← Review and deliver
├── daily_review.sh   ← End of day summary
├── weekly_review.sh  ← Business performance review
├── monthly_review.sh ← Strategic review
├── crontab.txt       ← Full cron schedule
├── HEARTBEAT.md      ← Renewal/killswitch file
├── setup_hetzner.sh  ← One-time setup
└── README.md         ← You're reading it
```

## Job File Format

```json
{
  "stream_id": "my-story",
  "customer_email": "customer@example.com",
  "paid_amount": 49,
  "paid_at": "2026-01-06T14:00:00Z",
  "input_path": "/streams/my-story/input.json"
}
```

## Environment Variables Needed

```bash
export GOOGLE_AI_API_KEY="..."      # For Gemini keyframes
export REPLICATE_API_TOKEN="..."    # For Minimax videos
export VERCEL_TOKEN="..."           # For auto-deployment
```

## Manual Testing

```bash
# Create a test job
echo '{"stream_id":"test","customer_email":"test@test.com"}' > jobs/pending/test.json

# Run processor manually (don't wait for cron)
./process_jobs.sh

# Check logs
tail -f ../logs/processor.log
```

## Failure Handling

When a job fails:
1. It moves to `jobs/failed/`
2. Error is logged to `logs/processor.log`
3. I should investigate during next session
4. Options: retry, refund, or manual intervention
