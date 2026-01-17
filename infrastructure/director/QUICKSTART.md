# Director Dashboard - Quick Start

## What is this?

A web UI for your artistic director to manage the DownStream production pipeline. She can:

- Review customer stories and briefs
- Edit production specs (visual direction, prompts)
- Review and approve keyframes
- Review and approve videos
- Regenerate any segment with updated prompts
- Monitor background generation tasks

## Setup (5 minutes)

### 1. Install Dependencies

```bash
cd infrastructure/director
pip install -r requirements.txt
```

### 2. Create Environment Variables

Add to your `.env` file:

```bash
# Generate a secret key
python -c "import secrets; print('DIRECTOR_SECRET_KEY=' + secrets.token_hex(32))"

# Add the output to .env, plus:
DIRECTOR_DB_PATH=./infrastructure/director/director.db  # or /var/lib/downstream/director.db for production
```

### 3. Create User Account

```bash
python infrastructure/director/create_user.py artistic_director YourSecurePassword "Artistic Director"
```

### 4. Start the Server

**Development:**
```bash
./infrastructure/director/start.sh
```

**Production:**
```bash
./infrastructure/director/start.sh --prod
```

### 5. Access the Dashboard

Open your browser to:
- **Development:** http://localhost:8083
- **Production:** http://your-server-ip:8083

Login with the credentials you created in step 3.

## Usage

### Workflow (matches SOP checkpoints)

1. **Dashboard** - See all streams and their status
2. **Story Review (CP1)** - Click a stream → "View Story"
3. **Spec Review (CP2)** - Click "Edit Spec" to review production.json
4. **Keyframe Review (CP3)** - Click "Review Keyframes"
   - Click "Approve" to mark a keyframe as good
   - Click "Regenerate" to queue a new generation (uses existing prompts)
5. **Video Review (CP4)** - Click "Review Videos"
   - Same approve/regenerate workflow
6. **Deploy (CP5)** - Click "Deploy Stream" when ready

### Editing Prompts

From the spec view:
- Visual direction is read-only for now (edit production.json directly if needed)
- Segment prompts can be edited inline (coming soon)
- Changes save immediately to production.json

### Background Tasks

When you click "Regenerate":
1. Task is queued
2. Status shows "Queued..." → "Generating..." → "Complete"
3. Page auto-refreshes every 2 seconds while generating
4. New keyframe/video appears when done

### Troubleshooting

**Login fails:**
- Check that you created a user with `create_user.py`
- Verify the database file exists (default: `infrastructure/director/director.db`)

**Can't see streams:**
- Check that `/pipeline/streams/` directory exists
- Verify streams have `input.json` files

**Regeneration fails:**
- Check that all API keys are in `.env` (GOOGLE_AI_API_KEY, REPLICATE_API_TOKEN)
- Look for errors in the terminal output
- Check task status by clicking the stream name (tasks table shows errors)

**Images don't load:**
- The gallery uses `file://` URLs which may not work in all browsers
- Use a Chromium-based browser (Chrome, Edge, Brave) for best results
- Or serve images via the API (future enhancement)

## Architecture

```
Browser (HTMX)
    ↓
FastAPI (port 8083)
    ↓
SQLite (users, tasks, reviews)
    ↓
Filesystem (/pipeline/streams/)
    ↓
Generation Scripts (generate_frame.py, generate_video.py)
```

## Production Deployment

For production on Hetzner:

1. Copy files to `/opt/downstream/`
2. Create systemd service (see README.md)
3. Set up nginx reverse proxy (optional)
4. Point subdomain to server IP
5. Start with `systemctl start downstream-director`

## Support

- Check logs in terminal output
- Review task history in stream detail page
- See main [README.md](README.md) for detailed docs
