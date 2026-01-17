#!/usr/bin/env python3
"""
Deterministic scroll capture script.

Takes screenshots at fixed intervals (default 100px) through an entire webpage.
The agent analyzes the output - it does not control the capture process.

Usage:
    python capture_scroll_frames.py <url> <output_dir> [--interval 100]
"""

import argparse
import os
import time
from pathlib import Path

from playwright.sync_api import sync_playwright


def capture_scroll_frames(
    url: str,
    output_dir: str,
    interval: int = 100,
    viewport_width: int = 1280,
    viewport_height: int = 800,
    wait_after_scroll: float = 0.3,
):
    """
    Capture screenshots at fixed scroll intervals.

    Args:
        url: The webpage to capture
        output_dir: Directory to save screenshots
        interval: Pixels between each screenshot (default 100)
        viewport_width: Browser viewport width
        viewport_height: Browser viewport height
        wait_after_scroll: Seconds to wait after scrolling (for animations to settle)

    Returns:
        dict with capture metadata
    """
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": viewport_width, "height": viewport_height}
        )
        page = context.new_page()

        # Navigate and wait for load
        page.goto(url, wait_until="networkidle")
        time.sleep(1)  # Extra wait for any lazy-loaded content

        # Get total scroll height
        total_height = page.evaluate("document.documentElement.scrollHeight")

        # Calculate number of screenshots needed
        num_screenshots = (total_height // interval) + 1

        print(f"URL: {url}")
        print(f"Total scroll height: {total_height}px")
        print(f"Interval: {interval}px")
        print(f"Screenshots to capture: {num_screenshots}")
        print(f"Output directory: {output_path}")
        print("-" * 50)

        captured = []

        for i in range(num_screenshots):
            scroll_position = i * interval

            # Don't scroll past the end
            if scroll_position > total_height - viewport_height:
                scroll_position = total_height - viewport_height

            # Scroll to position
            page.evaluate(f"window.scrollTo(0, {scroll_position})")
            time.sleep(wait_after_scroll)

            # Generate filename with zero-padded position
            filename = f"{scroll_position:05d}.png"
            filepath = output_path / filename

            # Capture screenshot
            page.screenshot(path=str(filepath))

            captured.append({
                "position": scroll_position,
                "filename": filename,
                "filepath": str(filepath)
            })

            print(f"Captured: {filename} (position {scroll_position}px)")

            # Stop if we've reached the end
            if scroll_position >= total_height - viewport_height:
                break

        browser.close()

        # Write metadata file
        metadata = {
            "url": url,
            "total_height": total_height,
            "interval": interval,
            "viewport": {"width": viewport_width, "height": viewport_height},
            "screenshots": captured,
            "count": len(captured)
        }

        import json
        metadata_path = output_path / "capture_metadata.json"
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)

        print("-" * 50)
        print(f"Capture complete: {len(captured)} screenshots")
        print(f"Metadata saved to: {metadata_path}")

        return metadata


def main():
    parser = argparse.ArgumentParser(
        description="Capture scroll frames at fixed intervals"
    )
    parser.add_argument("url", help="URL to capture")
    parser.add_argument("output_dir", help="Directory to save screenshots")
    parser.add_argument(
        "--interval",
        type=int,
        default=100,
        help="Pixels between screenshots (default: 100)"
    )
    parser.add_argument(
        "--width",
        type=int,
        default=1280,
        help="Viewport width (default: 1280)"
    )
    parser.add_argument(
        "--height",
        type=int,
        default=800,
        help="Viewport height (default: 800)"
    )
    parser.add_argument(
        "--wait",
        type=float,
        default=0.3,
        help="Wait time after scroll in seconds (default: 0.3)"
    )

    args = parser.parse_args()

    capture_scroll_frames(
        url=args.url,
        output_dir=args.output_dir,
        interval=args.interval,
        viewport_width=args.width,
        viewport_height=args.height,
        wait_after_scroll=args.wait
    )


if __name__ == "__main__":
    main()
