---
name: telegram-mini-app
description: Create and configure Telegram Mini Apps from DownStream streams. Enables full interactive experience inside Telegram.
---

# Telegram Mini App Setup

## Overview

DownStream streams can run as **Telegram Mini Apps** — full interactive experiences inside the Telegram messenger. Users never leave Telegram; they get the complete scroll-driven story.

## How It Works

```
Stream (deployed on Vercel) → Telegram Bot → User opens in Telegram → Full experience
```

The stream URL becomes the Mini App URL. Telegram's WebView loads your stream, and our SDK integration handles:
- Auto-expand to full screen
- Theme adaptation
- Viewport management
- Haptic feedback

---

## Setup Process

### Step 1: Deploy Stream (Already Done)

Your stream needs to be deployed to a public HTTPS URL.
After deployment, you have: `https://stream-xxx.vercel.app`

### Step 2: Create Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Start a chat and send `/newbot`
3. Follow prompts to set:
   - **Bot name**: e.g., "The Loop Story"
   - **Username**: e.g., `theloop_story_bot` (must end in `bot`)
4. BotFather gives you an **API token** — save this

### Step 3: Configure Mini App

1. Send `/mybots` to @BotFather
2. Select your bot
3. Choose **Bot Settings** → **Menu Button**
4. Select **Configure menu button**
5. Send the stream URL: `https://stream-xxx.vercel.app`
6. Send button text: e.g., "Read Story"

### Step 4: Test

1. Open your bot: `t.me/your_bot_username`
2. Tap the **Menu button** (bottom left)
3. Stream should open full-screen inside Telegram

---

## Alternative Launch Methods

### Web App Button (Inline)

Instead of menu button, add inline button in messages:

```
Send to @BotFather:
/setmenubutton
(Select your bot)
https://stream-xxx.vercel.app
```

### Direct Link

Share directly: `https://t.me/your_bot_username/app`

### Inline Mode

For advanced use: allows launching from any chat via `@your_bot inline_query`

---

## Configuration Options

### Basic Stream (Default)

Just deploy and link — works out of the box.

### With Analytics Tracking

Streams already include DownStream analytics. Telegram user info is available in logs:
- Platform (iOS, Android, Desktop)
- User language
- User ID (if consent given)

### With CTA Button

Add to `stream.config.json`:

```json
{
  "telegram": {
    "mainButton": {
      "text": "Visit Full Site",
      "url": "https://downstream.ink"
    }
  }
}
```

This shows Telegram's native bottom button.

---

## Verification Checklist

Before sharing:

- [ ] Stream loads in regular browser
- [ ] Stream loads inside Telegram (test on phone)
- [ ] Scroll works smoothly
- [ ] Animation plays correctly
- [ ] Text is readable
- [ ] No horizontal scroll issues

---

## Troubleshooting

### "Web App not available"

- Check URL is HTTPS (not HTTP)
- Verify SSL certificate is valid
- Try in incognito browser first

### Scroll not working

- Telegram WebView handles scroll differently
- Check no `overflow: hidden` on body
- Verify touch events aren't being captured

### Blank screen

- Check browser console for JS errors
- Verify all assets load (frames, fonts)
- SDK must load before React hydration

### Theme colors wrong

- Streams use their own theme by default
- To use Telegram's theme, access CSS vars:
  - `var(--tg-theme-bg-color)`
  - `var(--tg-theme-text-color)`

---

## Bot Automation (Advanced)

For automated bot creation, use the Telegram Bot API:

```bash
# Set menu button programmatically
curl -X POST "https://api.telegram.org/bot<TOKEN>/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d '{
    "menu_button": {
      "type": "web_app",
      "text": "Read Story",
      "web_app": {
        "url": "https://stream-xxx.vercel.app"
      }
    }
  }'
```

This could be integrated into the deployment pipeline to auto-create bots for each stream.

---

## Business Applications

### For Authors (B2C)

- Share story bot link on social media
- Readers experience story inside Telegram
- Track engagement via analytics
- Build audience via bot subscribers

### For Marketers (B2B)

- Product launch experiences
- Brand storytelling
- Event announcements
- Campaign landing pages (but inside Telegram)

### Pricing Consideration

Current: €49 per stream includes Telegram Mini App capability
Potential: Premium tier for bot automation + analytics dashboard

---

## Related Skills

- `stream-production` — Create the stream
- `finalize-stream` — Deploy to Vercel
- `create-marketing-clip` — Video content for promotion
