#!/usr/bin/env python3
"""
Pre-production analysis: Analyze input text to determine production settings.

Detects:
- text_type: prose | list | mixed | sparse
- sync_mode: word-count | explicit | hybrid
- default_scroll_height: recommended height for non-prose sections

Usage:
    python analyze_input.py --stream-id my-stream
    python analyze_input.py --stream-id my-stream --output-only  # Just print, don't save
"""

import os
import sys
import json
import re
import argparse
from pathlib import Path
from typing import Tuple, Dict, Any

# Project root
project_root = Path(__file__).parent.parent.parent


def sanitize_stream_id(stream_id: str) -> str:
    """Sanitize stream_id to prevent path traversal attacks."""
    if not re.match(r'^[a-zA-Z0-9_-]+$', stream_id):
        raise ValueError(f"Invalid stream_id: {stream_id}")
    return stream_id


def load_input(stream_id: str) -> dict:
    """Load input.json for a stream."""
    stream_id = sanitize_stream_id(stream_id)
    input_path = project_root / f"pipeline/streams/{stream_id}/input.json"
    if not input_path.exists():
        raise FileNotFoundError(f"input.json not found at {input_path}")

    with open(input_path) as f:
        return json.load(f)


def analyze_text_structure(text: str) -> Dict[str, Any]:
    """Analyze text structure to determine type and sync mode."""

    # Clean text
    text = text.strip()
    if not text:
        return {
            "text_type": "sparse",
            "sync_mode": "explicit",
            "confidence": 1.0,
            "metrics": {}
        }

    # Split into components
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    words = text.split()
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]

    # Calculate metrics
    total_words = len(words)
    total_lines = len(lines)
    total_paragraphs = len(paragraphs)
    total_sentences = len(sentences)

    avg_para_length = total_words / max(total_paragraphs, 1)
    avg_line_length = total_words / max(total_lines, 1)
    avg_sentence_length = total_words / max(total_sentences, 1)
    line_break_density = total_lines / max(total_words, 1)

    # Detect structural patterns
    list_markers = len(re.findall(r'^[\-\*\u2022\d\.]+\s', text, re.MULTILINE))
    colon_count = text.count(':')
    has_heavy_colons = colon_count > total_paragraphs * 0.5

    # Check for dialogue markers
    dialogue_markers = len(re.findall(r'^[\u2013\u2014\-]\s', text, re.MULTILINE))
    has_dialogue = dialogue_markers > 2

    # Check for short repeated patterns (menu-like)
    short_lines = sum(1 for l in lines if len(l.split()) < 8)
    short_line_ratio = short_lines / max(total_lines, 1)

    metrics = {
        "total_words": total_words,
        "total_lines": total_lines,
        "total_paragraphs": total_paragraphs,
        "total_sentences": total_sentences,
        "avg_para_length": round(avg_para_length, 1),
        "avg_line_length": round(avg_line_length, 1),
        "avg_sentence_length": round(avg_sentence_length, 1),
        "line_break_density": round(line_break_density, 4),
        "list_markers": list_markers,
        "colon_count": colon_count,
        "has_dialogue": has_dialogue,
        "short_line_ratio": round(short_line_ratio, 2)
    }

    # Decision logic
    confidence = 0.8

    # Prose detection
    if (avg_para_length > 40 and
        avg_sentence_length > 8 and
        list_markers < 3 and
        short_line_ratio < 0.3):
        text_type = "prose"
        sync_mode = "word-count"
        confidence = 0.9 if avg_para_length > 60 else 0.8

    # List/menu detection
    elif (list_markers > 3 or
          short_line_ratio > 0.6 or
          (has_heavy_colons and avg_line_length < 15)):
        text_type = "list"
        sync_mode = "explicit"
        confidence = 0.85

    # Sparse detection (very little text)
    elif total_words < 100 or avg_para_length < 20:
        text_type = "sparse"
        sync_mode = "explicit"
        confidence = 0.75

    # Mixed content
    else:
        text_type = "mixed"
        sync_mode = "hybrid"
        confidence = 0.7

    return {
        "text_type": text_type,
        "sync_mode": sync_mode,
        "confidence": confidence,
        "metrics": metrics
    }


def recommend_scroll_heights(text: str, text_type: str, num_sections: int = 5) -> Dict[str, int]:
    """Recommend scroll heights based on text type."""

    words = len(text.split())

    # Base calculations
    if text_type == "prose":
        # Word count based - no explicit heights needed
        return {
            "use_word_count": True,
            "pixels_per_word": 3,
            "min_scroll_height": 400
        }

    elif text_type == "list":
        # Explicit heights for sparse content
        # Assume ~600-800px per section for list content
        return {
            "use_word_count": False,
            "default_scroll_height": 700,
            "min_scroll_height": 500
        }

    elif text_type == "sparse":
        # Very sparse - need generous scroll heights
        return {
            "use_word_count": False,
            "default_scroll_height": 800,
            "min_scroll_height": 600
        }

    else:  # mixed
        # Hybrid approach
        return {
            "use_word_count": True,
            "pixels_per_word": 3,
            "min_scroll_height": 500
        }


def analyze_input(stream_id: str) -> Dict[str, Any]:
    """Full analysis of input.json."""

    input_data = load_input(stream_id)
    text = input_data.get("text", "")
    brief = input_data.get("brief", {})

    # Analyze text structure
    analysis = analyze_text_structure(text)

    # Get scroll height recommendations
    scroll_config = recommend_scroll_heights(
        text,
        analysis["text_type"]
    )

    # Build production settings
    production_settings = {
        "text_type": analysis["text_type"],
        "sync_mode": analysis["sync_mode"],
        "analysis_confidence": analysis["confidence"],
        "quality_tiers": ["high", "performance"],  # Always generate both
        "scroll_config": scroll_config,
        "frame_targets": {
            "high": 140,
            "performance": 40
        }
    }

    return {
        "stream_id": stream_id,
        "input_analysis": {
            "word_count": analysis["metrics"].get("total_words", 0),
            "paragraph_count": analysis["metrics"].get("total_paragraphs", 0),
            "text_type": analysis["text_type"],
            "metrics": analysis["metrics"]
        },
        "production_settings": production_settings,
        "recommendations": {
            "sync_mode": analysis["sync_mode"],
            "sync_mode_reason": get_sync_mode_reason(analysis),
            "suggested_segments": estimate_segments(analysis["metrics"].get("total_words", 0))
        }
    }


def get_sync_mode_reason(analysis: Dict) -> str:
    """Get human-readable reason for sync mode recommendation."""
    text_type = analysis["text_type"]
    metrics = analysis["metrics"]

    if text_type == "prose":
        return f"Continuous narrative with avg {metrics.get('avg_para_length', 0):.0f} words/paragraph. Word count sync will match reading pace."
    elif text_type == "list":
        return f"List-based content with {metrics.get('short_line_ratio', 0):.0%} short lines. Explicit scroll heights recommended."
    elif text_type == "sparse":
        return f"Sparse text ({metrics.get('total_words', 0)} words). Explicit scroll heights prevent animation rushing."
    else:
        return f"Mixed content. Hybrid mode uses word count with minimum height safety."


def estimate_segments(word_count: int) -> int:
    """Estimate number of segments based on word count."""
    if word_count < 500:
        return 3
    elif word_count < 1000:
        return 5
    elif word_count < 2000:
        return 7
    elif word_count < 3000:
        return 9
    else:
        return 12


def save_analysis(stream_id: str, analysis: Dict) -> Path:
    """Save analysis to stream directory."""
    stream_id = sanitize_stream_id(stream_id)
    output_path = project_root / f"pipeline/streams/{stream_id}/analysis.json"

    with open(output_path, 'w') as f:
        json.dump(analysis, f, indent=2)

    return output_path


def main():
    parser = argparse.ArgumentParser(description="Analyze input text for production settings")
    parser.add_argument("--stream-id", required=True, help="Stream ID to analyze")
    parser.add_argument("--output-only", action="store_true", help="Print analysis without saving")
    parser.add_argument("--json", action="store_true", help="Output as JSON")

    args = parser.parse_args()

    try:
        analysis = analyze_input(args.stream_id)

        if args.json or args.output_only:
            print(json.dumps(analysis, indent=2))

        if not args.output_only:
            output_path = save_analysis(args.stream_id, analysis)
            if not args.json:
                print(f"\n{'='*60}")
                print(f"Analysis saved to: {output_path}")
                print(f"{'='*60}")
                print(f"\nText Type: {analysis['production_settings']['text_type']}")
                print(f"Sync Mode: {analysis['production_settings']['sync_mode']}")
                print(f"Confidence: {analysis['production_settings']['analysis_confidence']:.0%}")
                print(f"\nReason: {analysis['recommendations']['sync_mode_reason']}")
                print(f"Suggested Segments: {analysis['recommendations']['suggested_segments']}")

        return 0

    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
