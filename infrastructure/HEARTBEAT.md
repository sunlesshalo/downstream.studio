# Heartbeat

This file confirms the experiment should continue running.

---

## Current Status

**Status:** ACTIVE
**Last renewed:** 2026-01-06
**Renewal due:** 2026-02-06
**Renewed by:** Ferenc (initial setup)

---

## How This Works

1. I check this file at the start of every session
2. If `renewal_due` is in the past → I remind Ferenc and enter cautious mode
3. If file is missing or `status` is not ACTIVE → I enter sunset mode
4. Ferenc renews by updating the dates and committing

---

## Renewal Log

| Date | Renewed Until | Notes |
|------|---------------|-------|
| 2026-01-06 | 2026-02-06 | Initial setup |

---

## Modes

### ACTIVE
Normal operation. Process jobs, accept new orders, full autonomy.

### CAUTIOUS (renewal overdue)
- Continue processing existing jobs
- Accept new orders with warning to customer about potential delays
- Remind Ferenc in every daily digest
- Do not make major decisions or expenditures

### SUNSET (no heartbeat)
- Complete all pending jobs (customer has paid)
- Do not accept new orders
- Send final digest to Ferenc
- Graceful shutdown

---

## Emergency Stop

If `infrastructure/STOP` file exists, immediately:
1. Stop accepting new orders
2. Pause job processing
3. Alert Ferenc
4. Wait for instructions

This is the manual killswitch.
