#!/usr/bin/env python3
"""
Programmatic Ambient Music Generator for DownStream

Generates atmospheric soundscapes by composing music through code.
No external AI models - Claude composes through waveform synthesis.

Usage:
    python generate_soundscape.py -p production.json -o soundscape.mp3 -d 60
    python generate_soundscape.py --mood dark --duration 30 -o output.mp3
"""

import argparse
import json
import numpy as np
from scipy import signal
from scipy.io import wavfile
import os
import sys
import colorsys

# Check for pydub (optional, for MP3 export)
try:
    from pydub import AudioSegment
    HAS_PYDUB = True
except ImportError:
    HAS_PYDUB = False
    print("Warning: pydub not installed. Will output WAV only. Install with: pip install pydub")

# Constants
SAMPLE_RATE = 44100  # CD quality


# =============================================================================
# WAVEFORM GENERATORS
# =============================================================================

def sine_wave(frequency: float, duration: float, amplitude: float = 1.0) -> np.ndarray:
    """Generate a pure sine wave."""
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), endpoint=False)
    return amplitude * np.sin(2 * np.pi * frequency * t)


def layered_sine(base_freq: float, duration: float, harmonics: list = None) -> np.ndarray:
    """Generate layered sine waves at harmonic intervals.

    harmonics: list of (ratio, amplitude) tuples
               e.g., [(1.0, 1.0), (1.5, 0.5), (2.0, 0.3)] for fundamental + fifth + octave
    """
    if harmonics is None:
        harmonics = [(1.0, 1.0), (1.5, 0.3), (2.0, 0.2)]  # Default: root, fifth, octave

    result = np.zeros(int(SAMPLE_RATE * duration))
    for ratio, amp in harmonics:
        result += sine_wave(base_freq * ratio, duration, amp)

    # Normalize
    max_val = np.max(np.abs(result))
    if max_val > 0:
        result = result / max_val
    return result


def filtered_noise(duration: float, cutoff: float = 500) -> np.ndarray:
    """Generate low-pass filtered white noise for atmospheric texture."""
    samples = int(SAMPLE_RATE * duration)
    noise = np.random.randn(samples)

    # Design low-pass filter
    nyquist = SAMPLE_RATE / 2
    normalized_cutoff = min(cutoff / nyquist, 0.99)
    b, a = signal.butter(4, normalized_cutoff, btype='low')

    # Apply filter
    filtered = signal.filtfilt(b, a, noise)

    # Normalize
    max_val = np.max(np.abs(filtered))
    if max_val > 0:
        filtered = filtered / max_val
    return filtered


def vibrato(wave: np.ndarray, rate: float = 5.0, depth: float = 0.01) -> np.ndarray:
    """Apply vibrato (pitch modulation) to a waveform."""
    samples = len(wave)
    t = np.arange(samples) / SAMPLE_RATE
    modulation = 1 + depth * np.sin(2 * np.pi * rate * t)

    # Resample using modulation (simplified approach)
    indices = np.cumsum(modulation)
    indices = (indices / indices[-1] * (samples - 1)).astype(int)
    indices = np.clip(indices, 0, samples - 1)

    return wave[indices]


# =============================================================================
# ENVELOPES
# =============================================================================

def adsr_envelope(duration: float, attack: float = 0.1, decay: float = 0.1,
                  sustain: float = 0.7, release: float = 0.2) -> np.ndarray:
    """Generate ADSR envelope.

    attack, decay, release: proportions of total duration
    sustain: amplitude level during sustain phase (0-1)
    """
    samples = int(SAMPLE_RATE * duration)
    envelope = np.zeros(samples)

    attack_samples = int(attack * samples)
    decay_samples = int(decay * samples)
    release_samples = int(release * samples)
    sustain_samples = samples - attack_samples - decay_samples - release_samples

    idx = 0

    # Attack: 0 to 1
    if attack_samples > 0:
        envelope[idx:idx + attack_samples] = np.linspace(0, 1, attack_samples)
        idx += attack_samples

    # Decay: 1 to sustain level
    if decay_samples > 0:
        envelope[idx:idx + decay_samples] = np.linspace(1, sustain, decay_samples)
        idx += decay_samples

    # Sustain: constant level
    if sustain_samples > 0:
        envelope[idx:idx + sustain_samples] = sustain
        idx += sustain_samples

    # Release: sustain to 0
    if release_samples > 0:
        envelope[idx:idx + release_samples] = np.linspace(sustain, 0, release_samples)

    return envelope


def slow_swell(duration: float, peak_position: float = 0.5) -> np.ndarray:
    """Generate slow swelling envelope for ambient pads."""
    samples = int(SAMPLE_RATE * duration)
    t = np.linspace(0, 1, samples)

    # Smooth rise and fall using cosine
    peak_idx = int(peak_position * samples)
    envelope = np.zeros(samples)

    # Rise
    envelope[:peak_idx] = (1 - np.cos(np.pi * t[:peak_idx] / peak_position)) / 2
    # Fall
    remaining = t[peak_idx:] - peak_position
    envelope[peak_idx:] = (1 + np.cos(np.pi * remaining / (1 - peak_position))) / 2

    return envelope


# =============================================================================
# EFFECTS
# =============================================================================

def apply_lowpass(wave: np.ndarray, cutoff: float = 2000) -> np.ndarray:
    """Apply low-pass filter for warmth."""
    nyquist = SAMPLE_RATE / 2
    normalized_cutoff = min(cutoff / nyquist, 0.99)
    b, a = signal.butter(2, normalized_cutoff, btype='low')
    return signal.filtfilt(b, a, wave)


def simple_reverb(wave: np.ndarray, decay: float = 0.5, delay_ms: float = 50) -> np.ndarray:
    """Simple delay-based reverb simulation."""
    delay_samples = int(delay_ms * SAMPLE_RATE / 1000)

    # Create multiple delay taps
    result = wave.copy()
    for i, (tap_delay, tap_decay) in enumerate([
        (delay_samples, decay * 0.6),
        (delay_samples * 2, decay * 0.4),
        (delay_samples * 3, decay * 0.25),
        (delay_samples * 5, decay * 0.15),
    ]):
        if tap_delay < len(wave):
            delayed = np.zeros_like(wave)
            delayed[tap_delay:] = wave[:-tap_delay] * tap_decay
            result += delayed

    # Normalize
    max_val = np.max(np.abs(result))
    if max_val > 0:
        result = result / max_val
    return result


# =============================================================================
# MOOD PRESETS
# =============================================================================

MOOD_PRESETS = {
    "dark": {
        "base_freq": 55,           # Low A (bass)
        "harmonics": [(1.0, 1.0), (1.189, 0.3), (1.5, 0.2)],  # Minor third + fifth
        "filter_cutoff": 800,
        "reverb_decay": 0.7,
        "attack": 0.3,
        "noise_amount": 0.15,
        "vibrato_rate": 2.0,
    },
    "melancholic": {
        "base_freq": 82.4,         # Low E
        "harmonics": [(1.0, 1.0), (1.189, 0.4), (2.0, 0.15)],  # Minor third
        "filter_cutoff": 1000,
        "reverb_decay": 0.6,
        "attack": 0.25,
        "noise_amount": 0.1,
        "vibrato_rate": 3.0,
    },
    "hopeful": {
        "base_freq": 130.8,        # C3
        "harmonics": [(1.0, 1.0), (1.26, 0.4), (1.5, 0.3), (2.0, 0.2)],  # Major third + fifth
        "filter_cutoff": 2000,
        "reverb_decay": 0.5,
        "attack": 0.15,
        "noise_amount": 0.05,
        "vibrato_rate": 4.0,
    },
    "tension": {
        "base_freq": 73.4,         # D2
        "harmonics": [(1.0, 1.0), (1.414, 0.5), (1.682, 0.3)],  # Tritone + minor 7th
        "filter_cutoff": 1500,
        "reverb_decay": 0.4,
        "attack": 0.1,
        "noise_amount": 0.2,
        "vibrato_rate": 6.0,
    },
    "intimate": {
        "base_freq": 196,          # G3
        "harmonics": [(1.0, 1.0), (1.5, 0.2), (2.0, 0.1)],
        "filter_cutoff": 1800,
        "reverb_decay": 0.3,
        "attack": 0.2,
        "noise_amount": 0.03,
        "vibrato_rate": 3.5,
    },
    "cosmic": {
        "base_freq": 36.7,         # Very low D
        "harmonics": [(1.0, 0.8), (2.0, 0.5), (4.0, 0.3), (8.0, 0.15)],  # Octaves
        "filter_cutoff": 600,
        "reverb_decay": 0.8,
        "attack": 0.5,
        "noise_amount": 0.2,
        "vibrato_rate": 1.5,
    },
}


def get_mood_from_keywords(keywords: list) -> str:
    """Map production.json tone keywords to mood preset."""
    keyword_map = {
        "dark": "dark",
        "melancholic": "melancholic",
        "melancholy": "melancholic",
        "sad": "melancholic",
        "hopeful": "hopeful",
        "uplifting": "hopeful",
        "bright": "hopeful",
        "tense": "tension",
        "suspense": "tension",
        "thriller": "tension",
        "intimate": "intimate",
        "soft": "intimate",
        "warm": "intimate",
        "cosmic": "cosmic",
        "vast": "cosmic",
        "space": "cosmic",
        "ethereal": "cosmic",
    }

    for kw in keywords:
        kw_lower = kw.lower()
        if kw_lower in keyword_map:
            return keyword_map[kw_lower]

    return "dark"  # Default


def hex_to_mood_adjustment(hex_color: str) -> dict:
    """Convert hex color to mood adjustment parameters."""
    # Parse hex
    hex_color = hex_color.lstrip('#')
    r, g, b = tuple(int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4))

    # Convert to HSV
    h, s, v = colorsys.rgb_to_hsv(r, g, b)

    adjustments = {}

    # Brightness affects volume and filter
    adjustments["brightness"] = v
    adjustments["filter_mult"] = 0.5 + v  # Darker = more filtered

    # Saturation affects harmonic richness
    adjustments["harmonic_mult"] = 0.5 + s * 0.5

    # Hue affects intervals
    # Warm hues (red/orange/yellow: 0-0.2) → major intervals
    # Cool hues (blue/purple: 0.5-0.8) → minor intervals
    if 0 <= h <= 0.2 or h >= 0.9:  # Warm
        adjustments["interval_type"] = "major"
    elif 0.5 <= h <= 0.8:  # Cool
        adjustments["interval_type"] = "minor"
    else:  # Neutral
        adjustments["interval_type"] = "neutral"

    return adjustments


# =============================================================================
# MAIN COMPOSITION
# =============================================================================

def generate_soundscape(mood: str, duration: float, color_adjustments: dict = None) -> np.ndarray:
    """Generate a complete soundscape for the given mood.

    Args:
        mood: One of the MOOD_PRESETS keys
        duration: Length in seconds
        color_adjustments: Optional dict from hex_to_mood_adjustment()

    Returns:
        numpy array of audio samples (mono, float32, -1 to 1)
    """
    preset = MOOD_PRESETS.get(mood, MOOD_PRESETS["dark"])

    # Apply color adjustments if provided
    if color_adjustments:
        preset = preset.copy()
        preset["filter_cutoff"] = int(preset["filter_cutoff"] * color_adjustments.get("filter_mult", 1.0))

    print(f"Generating {mood} soundscape, {duration}s...")

    # Layer 1: Base drone with harmonics
    print("  Creating base drone...")
    drone = layered_sine(preset["base_freq"], duration, preset["harmonics"])
    drone = vibrato(drone, rate=preset["vibrato_rate"], depth=0.005)

    # Apply slow evolution envelope
    swell = slow_swell(duration, peak_position=0.6)
    drone = drone * swell

    # Layer 2: Higher pad (one octave up)
    print("  Adding harmonic pad...")
    pad_freq = preset["base_freq"] * 2
    pad = layered_sine(pad_freq, duration, [(1.0, 0.6), (1.5, 0.3)])
    pad_envelope = adsr_envelope(duration, attack=preset["attack"], decay=0.1, sustain=0.5, release=0.3)
    pad = pad * pad_envelope * 0.4

    # Layer 3: Atmospheric noise texture
    print("  Adding atmospheric texture...")
    noise = filtered_noise(duration, cutoff=preset["filter_cutoff"] * 0.3)
    noise = noise * slow_swell(duration, peak_position=0.4) * preset["noise_amount"]

    # Layer 4: Sub-bass pulse (very low, felt more than heard)
    print("  Adding sub-bass...")
    sub_freq = preset["base_freq"] / 2
    sub = sine_wave(sub_freq, duration, 0.3)
    sub_envelope = slow_swell(duration, peak_position=0.7)
    sub = sub * sub_envelope

    # Mix layers
    print("  Mixing layers...")
    mix = drone * 0.4 + pad * 0.25 + noise * 0.15 + sub * 0.2

    # Apply effects
    print("  Applying filters and reverb...")
    mix = apply_lowpass(mix, preset["filter_cutoff"])
    mix = simple_reverb(mix, decay=preset["reverb_decay"], delay_ms=60)

    # Final normalization
    max_val = np.max(np.abs(mix))
    if max_val > 0:
        mix = mix / max_val * 0.85  # Leave headroom

    print("  Done!")
    return mix.astype(np.float32)


def save_audio(audio: np.ndarray, output_path: str):
    """Save audio to file (WAV or MP3)."""
    # Convert to 16-bit PCM
    audio_int16 = (audio * 32767).astype(np.int16)

    if output_path.endswith('.mp3') and HAS_PYDUB:
        # Save as temp WAV first
        temp_wav = output_path.replace('.mp3', '_temp.wav')
        wavfile.write(temp_wav, SAMPLE_RATE, audio_int16)

        # Convert to MP3
        sound = AudioSegment.from_wav(temp_wav)
        sound.export(output_path, format="mp3", bitrate="192k")

        # Clean up temp file
        os.remove(temp_wav)
        print(f"Saved: {output_path} (MP3)")
    else:
        # Save as WAV
        wav_path = output_path if output_path.endswith('.wav') else output_path.replace('.mp3', '.wav')
        wavfile.write(wav_path, SAMPLE_RATE, audio_int16)
        print(f"Saved: {wav_path} (WAV)")


def load_production_json(path: str) -> dict:
    """Load production.json and extract mood parameters."""
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    result = {
        "mood_keywords": [],
        "colors": []
    }

    # Extract tone from brief
    if "input" in data and "brief" in data["input"]:
        brief = data["input"]["brief"]
        if "tone" in brief:
            if isinstance(brief["tone"], list):
                result["mood_keywords"].extend(brief["tone"])
            else:
                result["mood_keywords"].append(brief["tone"])

    # Extract colors from visual_direction
    if "visual_direction" in data:
        vd = data["visual_direction"]
        if "color_palette" in vd:
            for key, value in vd["color_palette"].items():
                if isinstance(value, str) and value.startswith('#'):
                    result["colors"].append(value)

    return result


# =============================================================================
# CLI
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Generate ambient soundscapes for DownStream clips"
    )
    parser.add_argument("-p", "--production", help="Path to production.json")
    parser.add_argument("-o", "--output", required=True, help="Output file path (.mp3 or .wav)")
    parser.add_argument("-d", "--duration", type=int, default=60, help="Duration in seconds (default: 60)")
    parser.add_argument("--mood", help="Override mood (dark, melancholic, hopeful, tension, intimate, cosmic)")

    args = parser.parse_args()

    mood = args.mood
    color_adjustments = None

    # Load from production.json if provided
    if args.production:
        if not os.path.exists(args.production):
            print(f"Error: {args.production} not found")
            sys.exit(1)

        print(f"Loading: {args.production}")
        params = load_production_json(args.production)

        if not mood and params["mood_keywords"]:
            mood = get_mood_from_keywords(params["mood_keywords"])
            print(f"Detected mood: {mood} (from keywords: {params['mood_keywords']})")

        if params["colors"]:
            # Use dominant color (first in palette)
            color_adjustments = hex_to_mood_adjustment(params["colors"][0])
            print(f"Color adjustment from: {params['colors'][0]}")

    if not mood:
        mood = "dark"
        print("Using default mood: dark")

    # Generate soundscape
    audio = generate_soundscape(mood, args.duration, color_adjustments)

    # Save output
    save_audio(audio, args.output)

    print(f"\nSoundscape generated successfully!")
    print(f"  Mood: {mood}")
    print(f"  Duration: {args.duration}s")
    print(f"  Output: {args.output}")


if __name__ == "__main__":
    main()
