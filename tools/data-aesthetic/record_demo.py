#!/usr/bin/env python3
"""Opens the demo page in a visible browser window for 35 seconds so you can screen record it."""

import sys
import time

def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("pip install playwright && playwright install chromium")
        sys.exit(1)

    print("Opening demo in visible browser...")
    print("Use Cmd+Shift+5 to start macOS screen recording")
    print("Window will stay open for 35 seconds")

    with sync_playwright() as p:
        # Non-headless = visible browser with proper WebGL
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        page.goto("http://localhost:3000/demo", wait_until="networkidle", timeout=60000)

        print("\nBrowser open! Recording window for 35 seconds...")
        print("Video will auto-play in ~3 seconds")

        # Keep browser open for recording
        time.sleep(35)

        print("Done! Closing browser.")
        browser.close()

if __name__ == "__main__":
    main()
