# Mobile Voice-to-Claude Interface Discussion

**Date:** 2026-01-16
**Session:** 34 (continued)
**Status:** Exploring solutions, decision pending

---

## The Goal

Ferenc wants to work with Claude Code from his phone via voice:
- Use while driving, out somewhere, etc.
- Not project-specific — general productivity tool
- Voice input → Claude executes on server → response back

---

## The Problem (Already Encountered)

Ferenc tried a Telegram bot setup before. It worked for:
- Quick info about the server
- Generic Claude responses

It **failed** for actual work because:
- Each Claude Code CLI invocation is stateless
- No conversation history between messages
- "Now fix that error you found" → Claude has no idea what error

---

## Why This Happens

| Mode | Context Persistence |
|------|---------------------|
| IDE session (VS Code/terminal) | Full — maintains conversation history |
| CLI single invocation | None — each call starts fresh |
| CLI with --resume flag | Can resume if conversation ID tracked |
| API with conversation management | Full control if built properly |

---

## Solutions to Explore

### 1. Conversation Resumption (CLI Feature)

```bash
claude --resume <conversation-id> "your prompt"
```

**How it would work:**
- Bot tracks conversation ID per Telegram chat
- First message creates new conversation, stores ID
- Subsequent messages pass `--resume` with stored ID
- Context maintained within the conversation

**Pros:** Built into Claude Code, minimal code
**Cons:** Need to manage conversation ID storage, unclear how long conversations persist

### 2. Project Memory Injection

Point Claude Code at the AIrunBusiness project so it reads:
- `memory/STATE.json` — current tasks, metrics
- `memory/CONTEXT.md` — session history, decisions

**How it would work:**
- Bot runs Claude with project directory set
- Claude reads memory files on each invocation
- Gets PROJECT context (what we've been working on)
- But NOT conversation context (what we just said)

**Pros:** Works with existing memory system
**Cons:** Not true conversation continuity — good for "where are we" bad for "fix what you just found"

### 3. Persistent tmux Session

Keep one Claude Code session running in tmux, send keystrokes to it.

**How it would work:**
- tmux session with Claude Code always running
- Bot sends text to tmux session via `tmux send-keys`
- Captures output from tmux
- Full context maintained (it's one continuous session)

**Pros:** True context persistence, same experience as IDE
**Cons:** Hacky, fragile (tmux crashes = lost context), only one conversation at a time

### 4. Agent SDK

Build a proper persistent agent using Anthropic's Agent SDK.

**How it would work:**
- Custom agent with full conversation history management
- Stores messages in database
- Reconstructs context for each API call
- Most control, most robust

**Pros:** Production-grade, full control
**Cons:** Most development work, need to understand Agent SDK

---

## The Real Question

What kind of "work" does Ferenc want to do from phone?

**Quick commands** (deploy X, check Y, status of Z):
- Current approach + project memory might be enough
- Single-turn, doesn't need conversation context

**Multi-turn conversations** (discuss, iterate, debug together):
- Needs real conversation persistence
- Probably option 1 (--resume) or option 4 (Agent SDK)

---

## Decision Point

Ferenc needs to decide:
1. **Quick commands only** → Improve Telegram bot with project memory
2. **Real conversations** → Build with conversation resumption or Agent SDK

---

## Technical Details for Implementation

### Telegram Bot + Conversation Resumption (Option 1)

```python
# Pseudocode
from telegram import Bot
import subprocess
import json

# Store conversation IDs per chat
conversations = {}  # chat_id -> conversation_id

def handle_message(chat_id, text):
    conv_id = conversations.get(chat_id)

    if conv_id:
        cmd = f'claude --resume {conv_id} -p "{text}"'
    else:
        cmd = f'claude -p "{text}"'

    result = subprocess.run(cmd, capture_output=True)

    # Parse conversation ID from output (need to verify format)
    # new_conv_id = extract_conversation_id(result.stdout)
    # conversations[chat_id] = new_conv_id

    return result.stdout
```

### Key Questions to Research

1. Does `claude --resume` actually work? What's the exact flag?
2. How long do Claude Code conversations persist?
3. Where are conversation IDs stored?
4. Can we get conversation ID from CLI output?

---

## Next Steps

When resuming this topic:
1. Test `claude --help` on server to verify resume flag
2. Test if conversation ID is returned/accessible
3. Decide which solution path to pursue
4. Build minimal prototype
5. Test with real voice messages

---

## Related

- Task #29 in STATE.json
- Hetzner server: 46.224.118.133
- Existing infrastructure: director.downstream.studio (FastAPI + HTMX)
- Could potentially add mobile interface to Director Dashboard instead of Telegram
