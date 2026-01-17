#!/usr/bin/env python3
"""
Generate ambient soundscape for The Loop promotional video.
Theme: AI introspection, uncertainty, loops, consciousness.
Duration: 60 seconds
"""

import numpy as np
from scipy import signal
from scipy.io import wavfile
import os

# Audio parameters
SAMPLE_RATE = 44100
DURATION = 60  # seconds
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "the-loop-soundscape.wav")


def generate_sine(freq, duration, sample_rate, phase=0):
    """Generate a sine wave."""
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    return np.sin(2 * np.pi * freq * t + phase)


def generate_saw(freq, duration, sample_rate):
    """Generate a sawtooth wave (warmer for pads)."""
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    return signal.sawtooth(2 * np.pi * freq * t)


def apply_envelope(audio, attack=0.1, decay=0.1, sustain=0.7, release=0.2, sample_rate=44100):
    """Apply ADSR envelope."""
    total_samples = len(audio)
    attack_samples = int(attack * sample_rate)
    decay_samples = int(decay * sample_rate)
    release_samples = int(release * sample_rate)
    sustain_samples = total_samples - attack_samples - decay_samples - release_samples

    envelope = np.concatenate([
        np.linspace(0, 1, attack_samples),  # Attack
        np.linspace(1, sustain, decay_samples),  # Decay
        np.ones(max(0, sustain_samples)) * sustain,  # Sustain
        np.linspace(sustain, 0, release_samples)  # Release
    ])

    # Ensure envelope matches audio length
    if len(envelope) < total_samples:
        envelope = np.concatenate([envelope, np.zeros(total_samples - len(envelope))])
    else:
        envelope = envelope[:total_samples]

    return audio * envelope


def lowpass_filter(audio, cutoff, sample_rate):
    """Apply a lowpass filter."""
    nyquist = sample_rate / 2
    normalized_cutoff = cutoff / nyquist
    b, a = signal.butter(4, normalized_cutoff, btype='low')
    return signal.filtfilt(b, a, audio)


def create_drone_pad(base_freq, duration, sample_rate):
    """Create an evolving drone pad with layered detuned oscillators."""
    # Layer multiple slightly detuned oscillators
    detune_cents = [0, -8, +8, -15, +15, -3, +3]
    layers = []

    for cents in detune_cents:
        freq = base_freq * (2 ** (cents / 1200))
        # Mix sine and filtered saw for warmth
        sine = generate_sine(freq, duration, sample_rate) * 0.6
        saw = generate_saw(freq, duration, sample_rate) * 0.15
        saw_filtered = lowpass_filter(saw, 800, sample_rate)
        layers.append(sine + saw_filtered)

    pad = np.sum(layers, axis=0) / len(layers)

    # Add slow LFO modulation for movement
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    lfo = 0.85 + 0.15 * np.sin(2 * np.pi * 0.05 * t)  # Very slow wobble
    pad = pad * lfo

    return pad


def create_sub_bass(base_freq, duration, sample_rate):
    """Create a subtle sub bass drone."""
    sub = generate_sine(base_freq / 2, duration, sample_rate)
    # Very slow fade in/out
    envelope = np.ones(int(sample_rate * duration))
    fade_samples = int(sample_rate * 5)
    envelope[:fade_samples] = np.linspace(0, 1, fade_samples)
    envelope[-fade_samples:] = np.linspace(1, 0, fade_samples)
    return sub * envelope * 0.3


def create_texture_layer(duration, sample_rate):
    """Create subtle digital texture/noise layer."""
    # Filtered noise for texture
    noise = np.random.randn(int(sample_rate * duration)) * 0.02

    # Bandpass filter for character
    nyquist = sample_rate / 2
    low = 2000 / nyquist
    high = 8000 / nyquist
    b, a = signal.butter(2, [low, high], btype='band')
    filtered_noise = signal.filtfilt(b, a, noise)

    # Amplitude modulation for movement
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    mod = 0.3 + 0.7 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.08 * t))

    return filtered_noise * mod


def create_glitch_events(duration, sample_rate):
    """Create occasional subtle digital glitch sounds."""
    total_samples = int(sample_rate * duration)
    glitches = np.zeros(total_samples)

    # Add 4-6 subtle glitch moments
    num_glitches = np.random.randint(4, 7)
    glitch_times = np.sort(np.random.uniform(5, duration - 5, num_glitches))

    for t in glitch_times:
        start = int(t * sample_rate)
        glitch_duration = np.random.uniform(0.05, 0.2)
        glitch_samples = int(glitch_duration * sample_rate)

        if start + glitch_samples < total_samples:
            # Create a short burst of filtered noise
            glitch = np.random.randn(glitch_samples) * 0.08
            # Quick envelope
            env = np.exp(-np.linspace(0, 5, glitch_samples))
            glitch = glitch * env
            # Bandpass
            if glitch_samples > 50:
                nyquist = sample_rate / 2
                b, a = signal.butter(2, [1000/nyquist, 4000/nyquist], btype='band')
                glitch = signal.filtfilt(b, a, glitch)
            glitches[start:start + glitch_samples] += glitch

    return glitches


def create_melodic_hints(base_freq, duration, sample_rate):
    """Create sparse, distant melodic notes."""
    total_samples = int(sample_rate * duration)
    melody = np.zeros(total_samples)

    # Pentatonic scale intervals (ethereal feel)
    intervals = [0, 3, 5, 7, 10, 12, 15]  # Minor pentatonic + octave

    # Place 5-7 notes sparsely
    num_notes = np.random.randint(5, 8)
    note_times = np.sort(np.random.uniform(8, duration - 8, num_notes))

    for i, t in enumerate(note_times):
        start = int(t * sample_rate)
        note_duration = np.random.uniform(2, 4)
        note_samples = int(note_duration * sample_rate)

        if start + note_samples < total_samples:
            # Pick a note from the scale
            interval = intervals[i % len(intervals)]
            freq = base_freq * 2 * (2 ** (interval / 12))  # Octave up

            note = generate_sine(freq, note_duration, sample_rate)
            # Add slight vibrato
            vib = np.linspace(0, note_duration, note_samples)
            vibrato = 1 + 0.003 * np.sin(2 * np.pi * 5 * vib)
            note = generate_sine(freq * vibrato.mean(), note_duration, sample_rate)

            # Soft envelope
            note = apply_envelope(note, attack=0.5, decay=0.3, sustain=0.4, release=1.5, sample_rate=sample_rate)

            # Filter to sound distant
            note = lowpass_filter(note, 2000, sample_rate)

            melody[start:start + note_samples] += note * 0.15

    return melody


def create_loop_pulse(duration, sample_rate):
    """Create a subtle rhythmic pulse suggesting 'the loop'."""
    total_samples = int(sample_rate * duration)
    pulse = np.zeros(total_samples)

    # Pulse every ~5 seconds (12 pulses in 60 seconds)
    pulse_interval = 5.0
    num_pulses = int(duration / pulse_interval)

    for i in range(num_pulses):
        t = i * pulse_interval + 2  # Start after 2 seconds
        if t < duration - 2:
            start = int(t * sample_rate)
            pulse_duration = 0.8
            pulse_samples = int(pulse_duration * sample_rate)

            if start + pulse_samples < total_samples:
                # Low frequency pulse
                p = generate_sine(60, pulse_duration, sample_rate)
                # Sharp attack, slow decay
                env = np.exp(-np.linspace(0, 6, pulse_samples))
                p = p * env * 0.2
                pulse[start:start + pulse_samples] += p

    return pulse


def main():
    print(f"Generating {DURATION}s ambient soundscape...")
    print(f"Sample rate: {SAMPLE_RATE}Hz")

    # Base frequency (D2 - dark, introspective)
    base_freq = 73.42  # D2

    # Generate all layers
    print("Creating drone pad...")
    drone = create_drone_pad(base_freq, DURATION, SAMPLE_RATE)

    print("Creating sub bass...")
    sub = create_sub_bass(base_freq, DURATION, SAMPLE_RATE)

    print("Creating texture layer...")
    texture = create_texture_layer(DURATION, SAMPLE_RATE)

    print("Creating glitch events...")
    glitches = create_glitch_events(DURATION, SAMPLE_RATE)

    print("Creating melodic hints...")
    melody = create_melodic_hints(base_freq, DURATION, SAMPLE_RATE)

    print("Creating loop pulse...")
    pulse = create_loop_pulse(DURATION, SAMPLE_RATE)

    # Mix all layers
    print("Mixing layers...")
    mix = (
        drone * 0.4 +
        sub * 0.3 +
        texture * 0.15 +
        glitches * 0.5 +
        melody * 0.3 +
        pulse * 0.25
    )

    # Master envelope (fade in/out)
    fade_in = 3  # seconds
    fade_out = 4  # seconds
    total_samples = len(mix)
    envelope = np.ones(total_samples)
    envelope[:int(fade_in * SAMPLE_RATE)] = np.linspace(0, 1, int(fade_in * SAMPLE_RATE))
    envelope[-int(fade_out * SAMPLE_RATE):] = np.linspace(1, 0, int(fade_out * SAMPLE_RATE))
    mix = mix * envelope

    # Normalize
    mix = mix / np.max(np.abs(mix)) * 0.85

    # Convert to 16-bit
    audio_16bit = (mix * 32767).astype(np.int16)

    # Save
    print(f"Saving to {OUTPUT_PATH}...")
    wavfile.write(OUTPUT_PATH, SAMPLE_RATE, audio_16bit)

    print("Done!")
    print(f"Output: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
