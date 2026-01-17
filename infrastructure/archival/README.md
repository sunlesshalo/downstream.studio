# Asset Archival System

Automatically archives generated assets to Google Drive after stream deployment, then cleans up server storage after 48 hours.

## Setup (One-time on Hetzner Server)

### 1. Install rclone

```bash
curl https://rclone.org/install.sh | sudo bash
```

### 2. Configure Google Drive Remote

```bash
rclone config
```

Follow prompts:
1. `n` for new remote
2. Name: `gdrive`
3. Storage: `drive` (Google Drive)
4. Client ID: leave blank (uses rclone's)
5. Client Secret: leave blank
6. Scope: `1` (full access)
7. Root folder ID: leave blank (or specify a folder ID)
8. Service Account: leave blank
9. Edit advanced config: `n`
10. Use auto config: `n` (server is headless)
11. Follow the link, authorize, paste the code

### 3. Verify Connection

```bash
rclone lsd gdrive:
```

Should list your Drive folders.

### 4. Create Archive Folder

```bash
rclone mkdir gdrive:downstream-assets
```

## Usage

### Archive a Stream's Assets

```bash
/root/downstream/infrastructure/archival/archive_assets.sh {stream-id}
```

This will:
1. Upload `streams/specs/{stream-id}/videos/` to `gdrive:downstream-assets/{stream-id}/videos/`
2. Upload `streams/specs/{stream-id}/keyframes/` to `gdrive:downstream-assets/{stream-id}/keyframes/`
3. Create a manifest file with metadata
4. Schedule deletion for 48 hours later

### Manual Cleanup

```bash
/root/downstream/infrastructure/archival/cleanup_old_assets.sh
```

### Cron Jobs (Already Configured)

```cron
# Run cleanup check every 6 hours
0 */6 * * * /root/downstream/infrastructure/archival/cleanup_old_assets.sh >> /var/log/downstream/cleanup.log 2>&1
```

## Directory Structure on Google Drive

```
downstream-assets/
├── bolyai/
│   ├── videos/
│   │   ├── segment_1.mp4
│   │   ├── segment_2.mp4
│   │   └── ...
│   ├── keyframes/
│   │   ├── segment_1_keyframe.png
│   │   └── ...
│   └── manifest.json
├── az-utols-iro/
│   └── ...
└── ...
```

## manifest.json Format

```json
{
  "stream_id": "bolyai",
  "archived_at": "2026-01-17T12:00:00Z",
  "delete_after": "2026-01-19T12:00:00Z",
  "files": {
    "videos": ["segment_1.mp4", "segment_2.mp4", ...],
    "keyframes": ["segment_1_keyframe.png", ...]
  },
  "sizes": {
    "videos_mb": 150,
    "keyframes_mb": 5
  }
}
```
