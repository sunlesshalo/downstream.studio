# DownStream Director Dashboard

Web UI for artistic directors to manage the production pipeline.

## Features

- **Authentication**: Secure login with sessions
- **Stream Management**: View all streams and their production status
- **Story Review** (CP1): Review customer's story and brief
- **Production Spec** (CP2): Edit visual direction and segment prompts
- **Keyframe Review** (CP3): Gallery view to approve/regenerate keyframes
- **Video Review** (CP4): Gallery view to approve/regenerate videos
- **Final Review** (CP5): Preview and deploy streams

## Setup

### 1. Install Dependencies

```bash
cd infrastructure/director
pip install -r requirements.txt
```

### 2. Create Initial User

```bash
python create_user.py username password "Display Name"
```

Example:
```bash
python create_user.py artistic_director SecurePass123 "Artistic Director"
```

### 3. Set Environment Variables

Add to your `.env` file:

```bash
DIRECTOR_SECRET_KEY=your_random_32_byte_hex_key
DIRECTOR_DB_PATH=/var/lib/downstream/director.db  # or local path for development
```

### 4. Run the Server

**Development:**
```bash
uvicorn infrastructure.director.api:app --reload --port 8083
```

**Production (Hetzner):**
```bash
cd /opt/downstream
uvicorn infrastructure.director.api:app --host 0.0.0.0 --port 8083
```

Or with systemd:
```bash
sudo systemctl start downstream-director
sudo systemctl enable downstream-director
```

## Usage

1. Navigate to `http://localhost:8083` (or your server's IP)
2. Log in with your credentials
3. View streams from the dashboard
4. Click on a stream to manage its production

## Workflow (Mapped to SOP)

| Checkpoint | Screen | Action |
|------------|--------|--------|
| CP1: Review Brief | `/streams/{id}/story` | Read input, understand intent |
| CP2: Review Spec | `/streams/{id}/spec` | Edit visual direction, prompts |
| CP3: Review Keyframes | `/streams/{id}/keyframes` | Approve/regenerate images |
| CP4: Review Videos | `/streams/{id}/videos` | Approve/regenerate videos |
| CP5: Final Review | `/streams/{id}/preview` | Preview and deploy |

## API Endpoints

See [api.py](api.py) for full endpoint documentation.

## Database

SQLite database stores:
- Users and sessions
- Background task queue
- Review decisions (audit trail)

Schema: [schema.sql](schema.sql)

## Architecture

- **FastAPI**: Web framework
- **HTMX**: Interactive UI without heavy JavaScript
- **Jinja2**: Server-side templating
- **SQLite**: Embedded database
- **Threading**: Background task queue

## Development

The dashboard reads streams from `/pipeline/streams/` directory. Each stream should have:
- `input.json` - Customer's story and brief
- `production.json` - Full production specification
- `keyframes/` - Generated keyframe images
- `videos/` - Generated video files
- `deployment.json` - Deployment info

## Security

- Passwords hashed with SHA-256 + random salt
- Session tokens are secure random strings
- Sessions expire after 7 days
- HTTP-only cookies prevent XSS attacks
