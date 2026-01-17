# Director Dashboard - Improvement Suggestions

Based on the current implementation, here are 15 actionable improvements to enhance the platform:

## 🎯 High Priority UX Improvements

### 1. Real-Time Generation Status
**Problem:** Can't see what's currently being generated or track progress
**Solution:** Add Server-Sent Events (SSE) for live status updates
```python
@app.get("/streams/{stream_id}/status/stream")
async def stream_status(stream_id: str):
    async def event_generator():
        while True:
            tasks = get_active_tasks(stream_id)
            yield f"data: {json.dumps(tasks)}\n\n"
            await asyncio.sleep(2)
    return EventSourceResponse(event_generator())
```
**Benefit:** Director sees "Generating segment 5... 45% complete" in real-time

---

### 2. Keyboard Shortcuts
**Problem:** Everything requires mouse clicks, slowing down workflow
**Solution:** Add keyboard navigation
- `Space` = Approve current asset
- `R` = Regenerate current asset
- `N` = Next segment
- `P` = Previous segment
- `V` = Toggle version history
- `Esc` = Close modal
- `Ctrl+S` = Save prompts
- `Ctrl+A` = Select all visible assets

**Implementation:**
```javascript
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && !e.target.matches('textarea, input')) {
        e.preventDefault();
        approveAsset();
    }
    // ... other shortcuts
});
```

---

### 3. Inline Quick Edit
**Problem:** Must open modal to make small prompt tweaks
**Solution:** Add contenteditable prompts directly in grid view
- Click prompt text in grid → becomes editable
- Press Enter → saves immediately
- Press Escape → cancels

**Benefit:** 80% of edits don't need modal

---

### 4. Batch Regeneration
**Problem:** "Regenerate Selected" button doesn't work yet
**Solution:** Implement bulk regeneration endpoint
```python
@app.post("/streams/{stream_id}/bulk-regenerate")
async def bulk_regenerate(segment_ids: str, asset_type: str):
    # Queue all regenerations
    task_ids = []
    for seg_id in segment_ids.split(','):
        task_id = enqueue_generation(stream_id, int(seg_id), asset_type)
        task_ids.append(task_id)
    return {"status": "queued", "tasks": task_ids}
```

---

### 5. Comments & Feedback System
**Problem:** No way to leave notes on specific segments
**Solution:** Add comments field to review modal
- Add `notes` column to reviews table (already exists!)
- Show comment icon on segments with notes
- Display comment history in modal

```html
<textarea placeholder="Leave feedback about this segment..."></textarea>
```

**Benefit:** "Try more dramatic lighting" instead of regenerating blindly

---

## 🔧 Workflow Enhancements

### 6. Smart Comparison View
**Problem:** Can only see versions one at a time in list
**Solution:** Add side-by-side comparison mode
- Button: "Compare with previous"
- Split screen showing current vs selected version
- For videos: synchronized playback

```html
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
    <video id="current">...</video>
    <video id="previous">...</video>
</div>
<script>
// Sync playback
document.querySelectorAll('video').forEach(v => {
    v.addEventListener('play', () => {
        document.querySelectorAll('video').forEach(other => other.play());
    });
});
</script>
```

---

### 7. Preset Prompt Library
**Problem:** Repeating same prompt tweaks across segments
**Solution:** Save commonly used prompt modifications
- "More dramatic lighting"
- "Slower camera movement"
- "Warmer color palette"
- Click to apply to motion/image prompt

```python
# Store in database
CREATE TABLE prompt_presets (
    id INTEGER PRIMARY KEY,
    name TEXT,
    prompt_text TEXT,
    category TEXT  -- 'lighting', 'motion', 'color'
);
```

---

### 8. Progress Persistence
**Problem:** Page refresh loses work-in-progress status
**Solution:** Save scroll position, selected segments, open accordions
```javascript
// Before refresh
localStorage.setItem('director-state', JSON.stringify({
    selectedSegments: getSelectedSegments(),
    scrollPosition: window.scrollY,
    openAccordions: getOpenAccordions()
}));

// After refresh
const state = JSON.parse(localStorage.getItem('director-state'));
restoreUIState(state);
```

---

### 9. Generate from Reference
**Problem:** Can't use existing segment as starting point
**Solution:** Add "Use as reference" feature
- Button on each segment: "Generate similar"
- Copies prompt + adds "in the style of segment X"
- Creates variation instead of random generation

---

### 10. Task Cancellation
**Problem:** Can't stop a generation that's clearly going wrong
**Solution:** Add cancel button to running tasks
```python
import signal

def cancel_task(task_id):
    task = get_task(task_id)
    if task['process_id']:
        os.kill(task['process_id'], signal.SIGTERM)
        update_task_status(task_id, 'cancelled')
```

Show cancel button in UI:
```html
{% if task.status == 'running' %}
<button onclick="cancelTask('{{ task.id }}')">Cancel</button>
{% endif %}
```

---

## 📊 Workflow Insights

### 11. Activity Timeline
**Problem:** Can't see what happened when
**Solution:** Add timeline view showing all actions
- "10:23 AM - Regenerated segment 5"
- "10:25 AM - Approved keyframes 1-4"
- "10:30 AM - Modified prompt for segment 7"

```python
@app.get("/streams/{stream_id}/activity")
async def get_activity(stream_id: str):
    return db.execute(
        """SELECT reviewed_at, asset_type, segment_id, decision, notes
           FROM reviews WHERE stream_id = ?
           ORDER BY reviewed_at DESC LIMIT 50""",
        (stream_id,)
    ).fetchall()
```

---

### 12. Smart Defaults & Recommendations
**Problem:** Director doesn't know what settings work best
**Solution:** Learn from approval patterns
- Track which prompts get approved first time
- Suggest similar prompts for new segments
- "Segments with 'gentle pan' motion had 90% approval rate"

---

### 13. Bulk Export & Backup
**Problem:** No way to download all versions or backups
**Solution:** Add export functionality
- "Download all keyframes as ZIP"
- "Export production spec as JSON"
- "Backup all versions to Google Drive"

```python
@app.get("/streams/{stream_id}/export/keyframes")
async def export_keyframes(stream_id: str):
    import zipfile
    import io

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
        for kf in get_keyframes(stream_id):
            zip_file.write(kf.path, f"segment_{kf.id}.png")

    return StreamingResponse(zip_buffer, media_type="application/zip")
```

---

### 14. Diff Visualization for Prompts
**Problem:** Hard to see what changed between prompt versions
**Solution:** Show diff when editing prompts
```javascript
function showDiff(original, modified) {
    // Highlight what changed
    const diff = Diff.diffWords(original, modified);
    diff.forEach(part => {
        const span = document.createElement('span');
        span.style.background = part.added ? '#90EE90' :
                                part.removed ? '#FFB6C1' : 'transparent';
        span.textContent = part.value;
        diffContainer.appendChild(span);
    });
}
```

---

### 15. Quality Metrics Dashboard
**Problem:** No visibility into overall stream quality
**Solution:** Add quality overview page
- Average regenerations per segment
- Approval rate
- Most problematic segments
- Time spent per checkpoint

```python
@app.get("/streams/{stream_id}/metrics")
async def get_metrics(stream_id: str):
    return {
        "total_regenerations": count_regenerations(stream_id),
        "approval_rate": calculate_approval_rate(stream_id),
        "avg_time_per_checkpoint": get_checkpoint_times(stream_id),
        "segments_needing_attention": find_problem_segments(stream_id)
    }
```

Display as simple cards:
```html
<div class="metrics-grid">
    <div class="metric-card">
        <h4>Approval Rate</h4>
        <div class="metric-value">87%</div>
    </div>
    <div class="metric-card">
        <h4>Avg Regenerations</h4>
        <div class="metric-value">1.3 per segment</div>
    </div>
</div>
```

---

## 🔒 Security & Stability

### 16. Version Cleanup Policy
**Problem:** Unlimited version history fills disk
**Implementation:** Keep last N versions, archive rest to Google Drive
```python
def cleanup_old_versions(stream_id, keep_last=5):
    versions = get_versions(stream_id)
    if len(versions) > keep_last:
        old_versions = versions[keep_last:]
        for v in old_versions:
            # Archive to Google Drive
            upload_to_drive(v.path)
            # Delete local copy
            v.path.unlink()
```

---

### 17. Auto-Save Drafts
**Problem:** Losing prompt edits if browser crashes
**Solution:** Auto-save to localStorage every 30 seconds
```javascript
setInterval(() => {
    const prompts = {
        image: document.getElementById('modal-image-prompt')?.value,
        motion: document.getElementById('modal-motion-prompt')?.value
    };
    localStorage.setItem(`draft-${currentSegmentId}`, JSON.stringify(prompts));
}, 30000);
```

---

## 📈 Analytics & Learning

### 18. A/B Testing for Prompts
**Problem:** Don't know which prompt variations work better
**Solution:** Generate 2-3 variations, let director pick best
- "Generate 3 variations" button
- Shows all 3 in grid
- Director picks winner
- System learns from choices

---

## Implementation Priority

**Week 1 (Must Have):**
1. Real-time generation status
2. Task cancellation
3. Keyboard shortcuts
4. Version cleanup policy

**Week 2 (Should Have):**
5. Comments system
6. Batch regeneration
7. Activity timeline
8. Smart comparison view

**Week 3 (Nice to Have):**
9. Preset prompt library
10. Quality metrics dashboard
11. Bulk export
12. Inline quick edit

**Future (Research):**
13. Generate from reference
14. Smart recommendations
15. A/B testing
16. Diff visualization
17. Progress persistence
18. Auto-save drafts

---

## Estimated Impact

| Feature | Time to Build | User Time Saved | Priority |
|---------|---------------|-----------------|----------|
| Keyboard shortcuts | 4h | 30% faster workflow | HIGH |
| Real-time status | 8h | Reduces uncertainty | HIGH |
| Batch regeneration | 4h | 50% faster bulk edits | HIGH |
| Comments system | 6h | Better collaboration | MED |
| Smart comparison | 12h | Faster decision making | MED |
| Quality metrics | 8h | Strategic insights | LOW |

**Total estimated effort:** 42 hours (1 week of focused development)
**Total workflow improvement:** ~40% reduction in time spent per stream
