#!/usr/bin/env python3
"""Generate animation frames using Nano Banana Pro (Gemini 3 Pro Image) API."""

import os
import sys
import argparse
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from project root
project_root = Path(__file__).parent.parent.parent  # pipeline/execution -> pipeline -> project root
load_dotenv(project_root / ".env")


def add_ai_metadata(image_path: str, generator: str = "Google Gemini"):
    """Add AI-generated metadata to image for EU AI Act compliance.

    Adds XMP and EXIF metadata indicating the image was AI-generated.
    Following emerging standards for AI content marking.
    """
    try:
        from PIL import Image
        import piexif
    except ImportError:
        # piexif not installed, try alternative approach
        try:
            from PIL import Image, PngImagePlugin

            # For PNG files, add metadata as text chunks
            if image_path.lower().endswith('.png'):
                img = Image.open(image_path)
                metadata = PngImagePlugin.PngInfo()
                metadata.add_text("AI-Generated", "true")
                metadata.add_text("AI-Generator", generator)
                metadata.add_text("AI-Generator-Provider", "DownStream (downstream.ink)")
                metadata.add_text("Generation-Date", datetime.utcnow().isoformat())
                metadata.add_text("EU-AI-Act-Disclosure", "This image was generated using artificial intelligence")
                img.save(image_path, pnginfo=metadata)
                return True
        except Exception as e:
            print(f"Warning: Could not add AI metadata: {e}")
            return False
        return False

    try:
        # For JPEG files with piexif
        if image_path.lower().endswith(('.jpg', '.jpeg')):
            exif_dict = piexif.load(image_path)

            # Add to UserComment field (standard EXIF field for custom data)
            user_comment = f"AI-Generated: true | Generator: {generator} | Provider: DownStream (downstream.ink) | EU AI Act Disclosure: This image was generated using artificial intelligence"
            exif_dict["Exif"][piexif.ExifIFD.UserComment] = piexif.helper.UserComment.dump(user_comment)

            # Add software tag
            exif_dict["0th"][piexif.ImageIFD.Software] = f"DownStream AI ({generator})"

            exif_bytes = piexif.dump(exif_dict)
            piexif.insert(exif_bytes, image_path)
            return True

        # For PNG files
        elif image_path.lower().endswith('.png'):
            from PIL import Image, PngImagePlugin
            img = Image.open(image_path)
            metadata = PngImagePlugin.PngInfo()
            metadata.add_text("AI-Generated", "true")
            metadata.add_text("AI-Generator", generator)
            metadata.add_text("AI-Generator-Provider", "DownStream (downstream.ink)")
            metadata.add_text("Generation-Date", datetime.utcnow().isoformat())
            metadata.add_text("EU-AI-Act-Disclosure", "This image was generated using artificial intelligence")
            img.save(image_path, pnginfo=metadata)
            return True

    except Exception as e:
        print(f"Warning: Could not add AI metadata: {e}")
        return False

    return False

def generate_frame(prompt: str, output_path: str, negative_prompt: str = None, reference_image: str = None):
    """Generate an animation frame using Nano Banana Pro.

    Args:
        prompt: Image generation prompt
        output_path: Where to save the generated image
        negative_prompt: Things to avoid in generation
        reference_image: Path to reference image for character consistency
    """

    api_key = os.getenv("GOOGLE_AI_API_KEY")
    if not api_key:
        print("Error: GOOGLE_AI_API_KEY not found in .env file")
        print("Get your API key at: https://aistudio.google.com/apikey")
        sys.exit(1)

    try:
        from google import genai
        from google.genai import types
        from PIL import Image
    except ImportError:
        print("Error: google-genai package not installed")
        print("Install with: pip install google-genai pillow")
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    # Combine prompt with negative prompt if provided
    full_prompt = prompt
    if negative_prompt:
        full_prompt = f"{prompt}\n\nNegative prompt (avoid these): {negative_prompt}"

    # Add reference image instruction if provided
    if reference_image:
        full_prompt = f"Use the reference image for character consistency. Maintain the same character appearance, clothing, and style. {full_prompt}"

    print(f"Generating frame with Nano Banana Pro...")
    print(f"Prompt: {prompt[:100]}...")
    if negative_prompt:
        print(f"Negative: {negative_prompt[:50]}...")
    if reference_image:
        print(f"Reference: {reference_image}")

    ref_image = None
    try:
        # Build contents list - text + optional reference image
        contents = []

        # Add reference image first if provided (for character consistency)
        if reference_image and Path(reference_image).exists():
            ref_image = Image.open(reference_image)
            contents.append(ref_image)
            print(f"Using reference image for character consistency")

        contents.append(full_prompt)

        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=contents,
            config=types.GenerateContentConfig(
                temperature=1.0,
                response_modalities=["IMAGE", "TEXT"],
            )
        )

        # Save the image
        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                Path(output_path).parent.mkdir(parents=True, exist_ok=True)
                image = part.as_image()
                image.save(output_path)
                print(f"✓ Frame saved to: {output_path}")

                # Add AI-generated metadata for EU AI Act compliance
                if add_ai_metadata(output_path, "Google Gemini"):
                    print(f"✓ AI metadata added to: {output_path}")

                return output_path

        print("✗ No image generated in response")
        return None

    except Exception as e:
        print(f"✗ Error generating image: {e}")
        import traceback
        traceback.print_exc()
        return None
    finally:
        # Clean up reference image to prevent resource leak
        if ref_image is not None:
            ref_image.close()


def main():
    parser = argparse.ArgumentParser(
        description="Generate animation frames for downstream streams"
    )
    parser.add_argument(
        "--prompt", "-p", 
        type=str, 
        required=True,
        help="Image generation prompt"
    )
    parser.add_argument(
        "--output", "-o", 
        type=str, 
        help="Output file path"
    )
    parser.add_argument(
        "--stream", "-n", 
        type=str, 
        help="Stream name (e.g., az-ehseg)"
    )
    parser.add_argument(
        "--segment", "-s", 
        type=int, 
        help="Segment number"
    )
    parser.add_argument(
        "--frame", "-f", 
        type=int, 
        default=1,
        help="Frame number (default: 1)"
    )
    parser.add_argument(
        "--negative",
        type=str,
        default="text, words, letters, logos, watermarks, UI elements, bright white background, low quality",
        help="Negative prompt (things to avoid)"
    )
    parser.add_argument(
        "--reference", "-r",
        type=str,
        help="Reference image path for character consistency"
    )

    args = parser.parse_args()

    # Determine output path
    if args.output:
        output_path = args.output
    elif args.stream and args.segment:
        frame_num = str(args.frame).zfill(4)
        output_path = str(
            project_root / f"streams/{args.stream}/public/frames/{args.segment}/frame_{frame_num}.png"
        )
    else:
        output_path = str(project_root / "execution/generated_frame.png")

    generate_frame(args.prompt, output_path, args.negative, args.reference)


if __name__ == "__main__":
    main()
