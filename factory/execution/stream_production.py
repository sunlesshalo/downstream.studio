#!/usr/bin/env python3
"""
Stream Production Pipeline - Automated visual generation for downstream streams.

Usage:
    python stream_production.py run --spec production.json
    python stream_production.py parse --spec production.json
    python stream_production.py develop --spec production.json
    python stream_production.py generate-images --spec production.json
    python stream_production.py generate-videos --spec production.json
    python stream_production.py extract-frames --spec production.json
    python stream_production.py validate --spec production.json
    python stream_production.py estimate --spec production.json
"""

import sys
import json
import argparse
import subprocess
import re
from pathlib import Path
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
project_root = Path(__file__).parent.parent.parent  # pipeline/execution -> pipeline -> project root
load_dotenv(project_root / ".env")

# Add execution directory to path for imports
sys.path.insert(0, str(project_root / "execution"))
from generate_video import extract_frames_dual, get_video_duration


def sanitize_stream_id(stream_id: str) -> str:
    """Sanitize stream_id to prevent path traversal attacks.

    Raises ValueError if stream_id contains invalid characters.
    """
    # Only allow alphanumeric, hyphens, underscores
    if not re.match(r'^[a-zA-Z0-9_-]+$', stream_id):
        raise ValueError(f"Invalid stream_id: {stream_id}. Only alphanumeric, hyphens, and underscores allowed.")

    # Reject if it looks like a path component
    if stream_id in ('.', '..') or '/' in stream_id or '\\' in stream_id:
        raise ValueError(f"Invalid stream_id: {stream_id}")

    return stream_id


class ProductionPipeline:
    """Orchestrates the complete visual production pipeline."""
    
    def __init__(self, spec_path: str, dry_run: bool = False):
        self.spec_path = Path(spec_path)
        self.dry_run = dry_run
        self.spec = self._load_spec()
        # Sanitize stream_id from spec to prevent path traversal
        self.stream_id = sanitize_stream_id(self.spec["stream"]["id"])
        self.stream_dir = project_root / "streams" / self.stream_id
        self.log = []
        
    def _load_spec(self) -> dict:
        """Load and validate production specification."""
        with open(self.spec_path) as f:
            spec = json.load(f)
        
        # Validate required fields
        required = ["stream", "segments"]
        for field in required:
            if field not in spec:
                raise ValueError(f"Missing required field: {field}")
        
        return spec
    
    def _log(self, stage: str, message: str, status: str = "info"):
        """Log production event."""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "stage": stage,
            "message": message,
            "status": status
        }
        self.log.append(entry)
        
        # Print to console
        icon = {"info": "ℹ", "success": "✓", "error": "✗", "warning": "⚠"}
        print(f"{icon.get(status, '•')} [{stage}] {message}")
    
    def _save_log(self):
        """Save production log to file."""
        log_path = self.stream_dir / "production_log.json"
        log_path.parent.mkdir(parents=True, exist_ok=True)
        with open(log_path, "w") as f:
            json.dump(self.log, f, indent=2)
    
    # =========================================================================
    # STAGE 1: PARSE
    # =========================================================================
    
    def parse(self) -> dict:
        """Parse and validate production spec."""
        self._log("parse", f"Parsing specification: {self.spec_path}")
        
        segments = self.spec.get("segments", [])
        self._log("parse", f"Found {len(segments)} segments")
        
        # Validate each segment
        for seg in segments:
            required_seg = ["id", "frame_count", "visual_description"]
            for field in required_seg:
                if field not in seg:
                    self._log("parse", f"Segment {seg.get('id', '?')} missing {field}", "warning")
        
        # Create output directories
        dirs = [
            self.stream_dir / "keyframes",
            self.stream_dir / "videos",
            self.stream_dir / "public" / "frames",
        ]
        for d in dirs:
            d.mkdir(parents=True, exist_ok=True)
            self._log("parse", f"Created directory: {d.relative_to(project_root)}")
        
        self._log("parse", "Parse complete", "success")
        return {"segments": len(segments), "stream_dir": str(self.stream_dir)}
    
    # =========================================================================
    # STAGE 2: DEVELOP PROMPTS
    # =========================================================================
    
    def develop(self) -> dict:
        """Develop detailed prompts for each segment."""
        self._log("develop", "Developing prompts from visual descriptions")
        
        visual_dir = self.spec.get("visual_direction", {})
        style = visual_dir.get("style", "cinematic")
        palette = visual_dir.get("color_palette", {})
        references = visual_dir.get("references", [])
        mood = visual_dir.get("mood", "atmospheric")
        forbidden = visual_dir.get("forbidden", [])
        
        prompts = {"segments": []}
        
        for seg in self.spec["segments"]:
            seg_id = seg["id"]
            self._log("develop", f"Developing prompt for segment {seg_id}")
            
            # Build image prompt
            visual_desc = seg.get("visual_description", "")
            narrative = seg.get("narrative_beat", "")
            key_elements = seg.get("key_elements", [])
            
            # Construct structured prompt
            image_prompt = self._build_image_prompt(
                visual_desc=visual_desc,
                style=style,
                palette=palette,
                references=references,
                mood=mood,
                key_elements=key_elements,
                characters=self._get_segment_characters(seg)
            )
            
            # Build negative prompt
            negative_prompt = self._build_negative_prompt(forbidden)
            
            # Build motion prompt
            motion = seg.get("motion", {})
            motion_prompt = self._build_motion_prompt(motion)
            
            prompts["segments"].append({
                "id": seg_id,
                "image_prompt": image_prompt,
                "negative_prompt": negative_prompt,
                "motion_prompt": motion_prompt,
                "frame_count": seg.get("frame_count", 60),
                "duration_seconds": seg.get("duration_seconds", 5)
            })
        
        # Save prompts
        prompts_path = self.stream_dir / "production_prompts.json"
        with open(prompts_path, "w") as f:
            json.dump(prompts, f, indent=2)
        
        self._log("develop", f"Saved prompts to {prompts_path.name}", "success")
        return prompts
    
    def _build_image_prompt(self, visual_desc: str, style: str, palette: dict,
                           references: list, mood: str, key_elements: list,
                           characters: list) -> str:
        """Build a detailed image generation prompt."""
        
        parts = [visual_desc]
        
        # Add style reference
        if style:
            parts.append(f"in the style of {style}")
        
        # Add artist/film references
        if references:
            parts.append(f"inspired by {', '.join(references)}")
        
        # Add color palette
        if palette:
            colors = [f"{k}: {v}" for k, v in palette.items() if v]
            if colors:
                parts.append(f"color palette: {', '.join(colors)}")
        
        # Add mood
        if mood:
            parts.append(f"{mood} atmosphere")
        
        # Add key elements
        if key_elements:
            parts.append(f"featuring: {', '.join(key_elements)}")
        
        # Add character descriptions
        for char in characters:
            parts.append(f"character: {char}")
        
        # Add technical specifications
        parts.extend([
            "cinematic composition",
            "film grain",
            "high detail",
            "16:9 aspect ratio"
        ])
        
        return ", ".join(parts)
    
    def _build_negative_prompt(self, forbidden: list) -> str:
        """Build negative prompt from forbidden elements."""
        base_negative = [
            "text", "words", "letters", "logos", "watermarks",
            "UI elements", "bright white background",
            "oversaturated", "plastic texture", "AI artifacts",
            "extra limbs", "distorted faces", "low quality", "blurry"
        ]
        
        all_negative = base_negative + forbidden
        return ", ".join(all_negative)
    
    def _build_motion_prompt(self, motion: dict) -> str:
        """Build motion prompt for video generation."""
        motion_type = motion.get("type", "drift")
        direction = motion.get("direction", "none")
        speed = motion.get("speed", "slow")
        
        motion_phrases = {
            ("zoom", "in", "slow"): "camera slowly zooms in, subtle movement",
            ("zoom", "out", "slow"): "camera slowly pulls back, revealing scale",
            ("pan", "left", "slow"): "camera slowly pans left to right",
            ("pan", "right", "slow"): "camera slowly pans right to left",
            ("drift", "none", "slow"): "gentle floating motion, subtle particle drift",
            ("static", "none", "slow"): "almost imperceptible movement, breathing atmosphere",
        }
        
        key = (motion_type, direction, speed)
        base = motion_phrases.get(key, f"{speed} {motion_type} motion")
        
        return f"{base}, atmospheric, cinematic"
    
    def _get_segment_characters(self, segment: dict) -> list:
        """Get character descriptions for a segment."""
        char_names = segment.get("characters", [])
        all_characters = self.spec.get("characters", {})
        
        descriptions = []
        for name in char_names:
            if name in all_characters:
                char = all_characters[name]
                desc = f"{name}: {char.get('description', '')}, {char.get('age', '')}"
                descriptions.append(desc)
        
        return descriptions
    
    # =========================================================================
    # STAGE 3: GENERATE IMAGES
    # =========================================================================
    
    def generate_images(self, segments: list = None) -> dict:
        """Generate key frame images for each segment."""
        self._log("generate-images", "Starting image generation")
        
        # Load prompts
        prompts_path = self.stream_dir / "production_prompts.json"
        if not prompts_path.exists():
            self._log("generate-images", "Prompts not found, running develop stage", "warning")
            self.develop()
        
        with open(prompts_path) as f:
            prompts = json.load(f)
        
        results = {"generated": [], "failed": []}
        
        for seg_prompt in prompts["segments"]:
            seg_id = seg_prompt["id"]
            
            # Skip if not in requested segments
            if segments and seg_id not in segments:
                continue
            
            output_path = self.stream_dir / "keyframes" / f"segment_{seg_id}.png"
            
            self._log("generate-images", f"Generating segment {seg_id}")
            
            if self.dry_run:
                self._log("generate-images", f"[DRY RUN] Would generate: {output_path.name}")
                results["generated"].append(seg_id)
                continue
            
            # Call generate_frame.py
            try:
                cmd = [
                    sys.executable,
                    str(project_root / "execution" / "generate_frame.py"),
                    "-p", seg_prompt["image_prompt"],
                    "-o", str(output_path),
                    "--negative", seg_prompt["negative_prompt"]
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True)
                
                if result.returncode == 0 and output_path.exists():
                    self._log("generate-images", f"Segment {seg_id} complete", "success")
                    results["generated"].append(seg_id)
                else:
                    self._log("generate-images", f"Segment {seg_id} failed: {result.stderr}", "error")
                    results["failed"].append(seg_id)
                    
            except Exception as e:
                self._log("generate-images", f"Segment {seg_id} error: {e}", "error")
                results["failed"].append(seg_id)
        
        return results
    
    # =========================================================================
    # STAGE 4: GENERATE VIDEOS
    # =========================================================================
    
    def generate_videos(self, segments: list = None, model: str = "minimax") -> dict:
        """Generate animated videos from key frames."""
        self._log("generate-videos", f"Starting video generation with {model}")
        
        # Load prompts for motion
        prompts_path = self.stream_dir / "production_prompts.json"
        with open(prompts_path) as f:
            prompts = json.load(f)
        
        results = {"generated": [], "failed": []}
        
        for seg_prompt in prompts["segments"]:
            seg_id = seg_prompt["id"]
            
            if segments and seg_id not in segments:
                continue
            
            keyframe_path = self.stream_dir / "keyframes" / f"segment_{seg_id}.png"
            video_path = self.stream_dir / "videos" / f"segment_{seg_id}.mp4"
            
            if not keyframe_path.exists():
                self._log("generate-videos", f"Keyframe missing for segment {seg_id}", "error")
                results["failed"].append(seg_id)
                continue
            
            self._log("generate-videos", f"Animating segment {seg_id}")
            
            if self.dry_run:
                self._log("generate-videos", f"[DRY RUN] Would animate: {keyframe_path.name}")
                results["generated"].append(seg_id)
                continue
            
            try:
                cmd = [
                    sys.executable,
                    str(project_root / "execution" / "generate_video.py"),
                    "-i", str(keyframe_path),
                    "-p", seg_prompt["motion_prompt"],
                    "-o", str(video_path),
                    "-m", model
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True)
                
                if result.returncode == 0 and video_path.exists():
                    self._log("generate-videos", f"Segment {seg_id} complete", "success")
                    results["generated"].append(seg_id)
                else:
                    self._log("generate-videos", f"Segment {seg_id} failed: {result.stderr}", "error")
                    results["failed"].append(seg_id)
                    
            except Exception as e:
                self._log("generate-videos", f"Segment {seg_id} error: {e}", "error")
                results["failed"].append(seg_id)
        
        return results
    
    # =========================================================================
    # STAGE 5: EXTRACT FRAMES
    # =========================================================================
    
    def extract_frames(self, segments: list = None) -> dict:
        """Extract frames from videos for StreamEngine in dual tiers.

        Extracts two quality tiers:
        - High quality: 140 frames per segment in public/frames/{segment_id}/
        - Performance: 40 frames per segment in public/frames-perf/{segment_id}/
        """
        self._log("extract-frames", "Starting dual-tier frame extraction")

        # Load prompts (for segment list)
        prompts_path = self.stream_dir / "production_prompts.json"
        with open(prompts_path) as f:
            prompts = json.load(f)

        results = {"extracted": [], "failed": [], "frame_counts": {}}
        public_dir = self.stream_dir / "public"

        for seg_prompt in prompts["segments"]:
            seg_id = seg_prompt["id"]

            if segments and seg_id not in segments:
                continue

            video_path = self.stream_dir / "videos" / f"segment_{seg_id}.mp4"

            if not video_path.exists():
                self._log("extract-frames", f"Video missing for segment {seg_id}", "error")
                results["failed"].append(seg_id)
                continue

            self._log("extract-frames", f"Extracting dual-tier frames for segment {seg_id}")

            if self.dry_run:
                frames_dir_high = public_dir / "frames" / str(seg_id)
                frames_dir_perf = public_dir / "frames-perf" / str(seg_id)
                self._log("extract-frames", f"[DRY RUN] Would extract to: {frames_dir_high} and {frames_dir_perf}")
                results["extracted"].append(seg_id)
                continue

            try:
                # Use dual extraction function
                frame_results = extract_frames_dual(
                    video_path=str(video_path),
                    output_dir_base=str(public_dir),
                    segment_id=seg_id,
                    high_frames=140,
                    perf_frames=40,
                    format="webp"
                )

                if frame_results["high"] > 0 and frame_results["perf"] > 0:
                    self._log("extract-frames",
                             f"Segment {seg_id}: {frame_results['high']} high, {frame_results['perf']} perf frames",
                             "success")
                    results["extracted"].append(seg_id)
                    results["frame_counts"][seg_id] = frame_results
                else:
                    self._log("extract-frames", f"Segment {seg_id} extraction failed", "error")
                    results["failed"].append(seg_id)

            except Exception as e:
                self._log("extract-frames", f"Segment {seg_id} error: {e}", "error")
                results["failed"].append(seg_id)

        return results
    
    # =========================================================================
    # STAGE 6: VALIDATE
    # =========================================================================
    
    def validate(self) -> dict:
        """Validate all generated assets including dual-tier frames."""
        self._log("validate", "Validating production output")

        issues = []
        # Expected frame counts for dual tiers
        expected_high = 140
        expected_perf = 40

        for seg in self.spec["segments"]:
            seg_id = seg["id"]

            # Check keyframe
            keyframe = self.stream_dir / "keyframes" / f"segment_{seg_id}.png"
            if not keyframe.exists():
                issues.append(f"Segment {seg_id}: Missing keyframe")

            # Check video
            video = self.stream_dir / "videos" / f"segment_{seg_id}.mp4"
            if not video.exists():
                issues.append(f"Segment {seg_id}: Missing video")

            # Check high-quality frames
            frames_dir_high = self.stream_dir / "public" / "frames" / str(seg_id)
            if frames_dir_high.exists():
                frames_high = list(frames_dir_high.glob("frame_*.webp"))
                if len(frames_high) < expected_high * 0.9:  # Allow 10% tolerance
                    issues.append(
                        f"Segment {seg_id}: High tier only {len(frames_high)}/{expected_high} frames"
                    )
            else:
                issues.append(f"Segment {seg_id}: Missing high-quality frames directory")

            # Check performance frames
            frames_dir_perf = self.stream_dir / "public" / "frames-perf" / str(seg_id)
            if frames_dir_perf.exists():
                frames_perf = list(frames_dir_perf.glob("frame_*.webp"))
                if len(frames_perf) < expected_perf * 0.9:  # Allow 10% tolerance
                    issues.append(
                        f"Segment {seg_id}: Perf tier only {len(frames_perf)}/{expected_perf} frames"
                    )
            else:
                issues.append(f"Segment {seg_id}: Missing performance frames directory")

        if issues:
            for issue in issues:
                self._log("validate", issue, "warning")
            self._log("validate", f"{len(issues)} issues found", "warning")
        else:
            self._log("validate", "All assets validated successfully (dual tiers)", "success")

        return {"valid": len(issues) == 0, "issues": issues}
    
    # =========================================================================
    # ESTIMATE COSTS
    # =========================================================================
    
    def estimate(self) -> dict:
        """Estimate production costs."""
        segments = self.spec.get("segments", [])
        num_segments = len(segments)
        
        # Cost estimates
        image_cost_per = 0.20  # Nano Banana Pro
        video_cost_per = 0.05  # Minimax
        
        image_total = num_segments * image_cost_per
        video_total = num_segments * video_cost_per
        total = image_total + video_total
        
        estimate = {
            "stream": self.stream_id,
            "segments": num_segments,
            "image_generation": {
                "model": "Nano Banana Pro",
                "cost_per_segment": image_cost_per,
                "total": image_total
            },
            "video_generation": {
                "model": "Minimax Hailuo",
                "cost_per_segment": video_cost_per,
                "total": video_total
            },
            "total_estimated_cost": total
        }
        
        print(f"\nCost Estimate for: {self.stream_id}")
        print(f"{'='*40}")
        print(f"Segments: {num_segments}")
        print(f"\nImage Generation (Nano Banana Pro):")
        print(f"  {num_segments} × ${image_cost_per:.2f} = ${image_total:.2f}")
        print(f"\nVideo Generation (Minimax):")
        print(f"  {num_segments} × ${video_cost_per:.2f} = ${video_total:.2f}")
        print(f"\n{'='*40}")
        print(f"Total Estimated Cost: ${total:.2f}")
        
        return estimate
    
    # =========================================================================
    # RUN FULL PIPELINE
    # =========================================================================
    
    def run(self, start_stage: int = 1, segments: list = None, 
            model: str = "minimax") -> dict:
        """Run the complete production pipeline."""
        self._log("run", f"Starting production pipeline for {self.stream_id}")
        
        stages = [
            (1, "parse", self.parse),
            (2, "develop", self.develop),
            (3, "generate-images", lambda: self.generate_images(segments)),
            (4, "generate-videos", lambda: self.generate_videos(segments, model)),
            (5, "extract-frames", lambda: self.extract_frames(segments)),
            (6, "validate", self.validate),
        ]
        
        results = {}
        
        for stage_num, stage_name, stage_func in stages:
            if stage_num < start_stage:
                self._log("run", f"Skipping stage {stage_num}: {stage_name}")
                continue
            
            self._log("run", f"Running stage {stage_num}: {stage_name}")
            
            try:
                results[stage_name] = stage_func()
            except Exception as e:
                self._log("run", f"Stage {stage_name} failed: {e}", "error")
                results[stage_name] = {"error": str(e)}
                break
        
        self._save_log()
        self._log("run", "Pipeline complete", "success")
        
        return results


def main():
    parser = argparse.ArgumentParser(
        description="Stream Production Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python stream_production.py run --spec production.json
  python stream_production.py estimate --spec production.json
  python stream_production.py run --spec production.json --segments 1,2,3
  python stream_production.py run --spec production.json --start-stage 3 --dry-run
        """
    )
    
    parser.add_argument(
        "command",
        choices=["run", "parse", "develop", "generate-images", 
                 "generate-videos", "extract-frames", "validate", "estimate"],
        help="Pipeline command to execute"
    )
    parser.add_argument(
        "--spec", "-s",
        required=True,
        help="Path to production specification JSON"
    )
    parser.add_argument(
        "--start-stage",
        type=int,
        default=1,
        help="Stage to start from (1-6)"
    )
    parser.add_argument(
        "--segments",
        type=str,
        help="Comma-separated segment IDs to process"
    )
    parser.add_argument(
        "--model", "-m",
        default="minimax",
        choices=["minimax", "kling", "kling-turbo"],
        help="Video generation model"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview without generating"
    )
    
    args = parser.parse_args()
    
    # Parse segments
    segments = None
    if args.segments:
        segments = [int(s.strip()) for s in args.segments.split(",")]
    
    # Create pipeline
    pipeline = ProductionPipeline(args.spec, dry_run=args.dry_run)
    
    # Execute command
    if args.command == "run":
        pipeline.run(start_stage=args.start_stage, segments=segments, model=args.model)
    elif args.command == "parse":
        pipeline.parse()
    elif args.command == "develop":
        pipeline.develop()
    elif args.command == "generate-images":
        pipeline.generate_images(segments)
    elif args.command == "generate-videos":
        pipeline.generate_videos(segments, args.model)
    elif args.command == "extract-frames":
        pipeline.extract_frames(segments)
    elif args.command == "validate":
        pipeline.validate()
    elif args.command == "estimate":
        pipeline.estimate()


if __name__ == "__main__":
    main()
