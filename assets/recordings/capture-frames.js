const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureFrames(options) {
  const {
    url,
    width,
    height,
    duration = 30000,
    fps = 24,
    outputDir,
    name,
    startSection,
    endSection,
    scaleToWidth,
    scaleToHeight,
    smooth = false
  } = options;

  // In smooth mode, capture at 2x fps then blend down
  const captureFps = smooth ? fps * 2 : fps;
  const targetFps = fps;

  const frameCount = Math.floor(duration / 1000 * captureFps);
  const frameDir = path.join(outputDir, `${name}-frames`);

  // Clean and create frame directory
  if (fs.existsSync(frameDir)) {
    fs.rmSync(frameDir, { recursive: true });
  }
  fs.mkdirSync(frameDir, { recursive: true });

  console.log(`Recording: ${name}`);
  if (smooth) {
    console.log(`Duration: ${duration / 1000}s, Capture: ${captureFps}fps → Output: ${targetFps}fps (smooth), Frames: ${frameCount}`);
  } else {
    console.log(`Duration: ${duration / 1000}s, FPS: ${captureFps}, Frames: ${frameCount}`);
  }
  if (scaleToWidth && scaleToHeight) {
    console.log(`Capture: ${width}x${height} → Final: ${scaleToWidth}x${scaleToHeight}`);
  } else {
    console.log(`Resolution: ${width}x${height}`);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width, height }
  });
  const page = await context.newPage();

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

  // Wait for content to be ready (with longer timeout for deployed sites)
  try {
    await page.waitForSelector('.ds-stream', { timeout: 30000 });
  } catch (e) {
    console.log('Warning: .ds-stream selector not found, continuing anyway');
  }

  // Wait for fonts and animations to settle
  await new Promise(r => setTimeout(r, 2000));

  // Get section positions if specified
  const scrollInfo = await page.evaluate(({ startSection, endSection }) => {
    const docHeight = document.documentElement.scrollHeight;
    const viewHeight = window.innerHeight;
    const totalScroll = docHeight - viewHeight;

    let startY = 0;
    let endY = totalScroll;

    // Find section positions
    const sections = document.querySelectorAll('.ds-section');
    const sectionData = [];

    sections.forEach((section, i) => {
      const rect = section.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      sectionData.push({
        index: i,
        id: section.id || `section-${i}`,
        top: top,
        bottom: top + rect.height
      });
    });

    if (startSection !== undefined && startSection !== null) {
      const start = sectionData.find(s =>
        s.id === startSection || s.index === parseInt(startSection)
      );
      if (start) {
        startY = Math.max(0, start.top - 50); // Small padding
      }
    }

    if (endSection !== undefined && endSection !== null) {
      const end = sectionData.find(s =>
        s.id === endSection || s.index === parseInt(endSection)
      );
      if (end) {
        endY = Math.min(totalScroll, end.bottom - viewHeight + 50);
      }
    }

    return {
      totalScroll,
      startY,
      endY,
      scrollRange: endY - startY,
      sections: sectionData.map(s => ({ id: s.id, index: s.index }))
    };
  }, { startSection, endSection });

  console.log(`Scroll range: ${scrollInfo.startY}px to ${scrollInfo.endY}px (${scrollInfo.scrollRange}px)`);
  if (scrollInfo.sections.length > 0) {
    console.log(`Sections found: ${scrollInfo.sections.map(s => s.id).join(', ')}`);
  }

  const startTime = Date.now();

  for (let i = 0; i < frameCount; i++) {
    const progress = i / (frameCount - 1);

    // Ease in-out
    const easeProgress = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    const scrollY = Math.floor(scrollInfo.startY + scrollInfo.scrollRange * easeProgress);

    await page.evaluate((y) => window.scrollTo(0, y), scrollY);

    // Small delay to let animations settle
    await new Promise(r => setTimeout(r, 20));

    const framePath = path.join(frameDir, `frame_${String(i).padStart(5, '0')}.png`);
    await page.screenshot({ path: framePath, timeout: 60000 });

    if (i % 50 === 0) {
      console.log(`Frame ${i}/${frameCount} (${Math.round(progress * 100)}%)`);
    }
  }

  await browser.close();

  const elapsed = (Date.now() - startTime) / 1000;
  console.log(`Captured ${frameCount} frames in ${elapsed.toFixed(1)}s`);

  // Create video with ffmpeg
  const outputVideo = path.join(outputDir, `${name}.mp4`);
  console.log(`Creating video: ${outputVideo}`);

  const { execSync } = require('child_process');

  // Build ffmpeg command with optional scaling and smoothing
  let vfFilters = [];

  // In smooth mode, blend adjacent frames then reduce framerate
  if (smooth) {
    vfFilters.push('tblend=all_mode=average');  // Blend adjacent frames
    vfFilters.push(`fps=${targetFps}`);  // Reduce to target fps
    console.log(`Applying frame blending: ${captureFps}fps → ${targetFps}fps`);
  }

  if (scaleToWidth && scaleToHeight) {
    vfFilters.push(`scale=${scaleToWidth}:${scaleToHeight}:flags=lanczos`);
    console.log(`Scaling output to ${scaleToWidth}x${scaleToHeight}`);
  }

  const vfArg = vfFilters.length > 0 ? `-vf "${vfFilters.join(',')}"` : '';

  execSync(`ffmpeg -y -framerate ${captureFps} -i "${frameDir}/frame_%05d.png" ${vfArg} -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p "${outputVideo}"`, {
    stdio: 'inherit'
  });

  console.log(`Video created: ${outputVideo}`);

  // Clean up frames
  fs.rmSync(frameDir, { recursive: true });
  console.log('Cleaned up frames');

  return outputVideo;
}

// Segment-based capture: hold at each section, no scrolling
async function captureSegments(options) {
  const {
    url,
    width,
    height,
    fps = 24,
    outputDir,
    name,
    segments = [0, 1, 2],  // Section indices to capture
    secondsPerSegment = 5,
    scaleToWidth,
    scaleToHeight
  } = options;

  const framesPerSegment = Math.floor(secondsPerSegment * fps);
  const totalFrames = framesPerSegment * segments.length;
  const frameDir = path.join(outputDir, `${name}-frames`);

  // Clean and create frame directory
  if (fs.existsSync(frameDir)) {
    fs.rmSync(frameDir, { recursive: true });
  }
  fs.mkdirSync(frameDir, { recursive: true });

  console.log(`Recording segments: ${name}`);
  console.log(`Segments: ${segments.join(', ')} (${secondsPerSegment}s each)`);
  console.log(`Total: ${segments.length * secondsPerSegment}s, FPS: ${fps}, Frames: ${totalFrames}`);
  if (scaleToWidth && scaleToHeight) {
    console.log(`Capture: ${width}x${height} → Final: ${scaleToWidth}x${scaleToHeight}`);
  } else {
    console.log(`Resolution: ${width}x${height}`);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width, height }
  });
  const page = await context.newPage();

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

  // Wait for content to be ready
  try {
    await page.waitForSelector('.ds-stream', { timeout: 30000 });
  } catch (e) {
    console.log('Warning: .ds-stream selector not found, continuing anyway');
  }

  // Wait for fonts and animations to settle
  await new Promise(r => setTimeout(r, 2000));

  // Get section positions
  const sectionData = await page.evaluate(() => {
    const sections = document.querySelectorAll('.ds-section');
    const viewHeight = window.innerHeight;
    return Array.from(sections).map((section, i) => {
      const rect = section.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      // Position to center section vertically (or top if section is taller than viewport)
      const scrollTo = Math.max(0, top - (viewHeight - rect.height) / 2);
      return {
        index: i,
        id: section.id || `section-${i}`,
        scrollTo
      };
    });
  });

  console.log(`Found ${sectionData.length} sections`);

  const startTime = Date.now();
  let frameIndex = 0;

  for (const segmentIdx of segments) {
    const section = sectionData[segmentIdx];
    if (!section) {
      console.log(`Warning: Section ${segmentIdx} not found, skipping`);
      continue;
    }

    console.log(`\nCapturing segment ${segmentIdx} (${section.id})...`);

    // Scroll to section position
    await page.evaluate((y) => window.scrollTo(0, y), section.scrollTo);

    // Wait for scroll and animations to settle
    await new Promise(r => setTimeout(r, 500));

    // Capture frames at this position
    for (let f = 0; f < framesPerSegment; f++) {
      const framePath = path.join(frameDir, `frame_${String(frameIndex).padStart(5, '0')}.png`);
      await page.screenshot({ path: framePath, timeout: 60000 });

      // Wait for next frame timing (maintaining fps)
      await new Promise(r => setTimeout(r, 1000 / fps));

      frameIndex++;

      if (f % 50 === 0 || f === framesPerSegment - 1) {
        console.log(`  Frame ${f + 1}/${framesPerSegment}`);
      }
    }
  }

  await browser.close();

  const elapsed = (Date.now() - startTime) / 1000;
  console.log(`\nCaptured ${frameIndex} frames in ${elapsed.toFixed(1)}s`);

  // Create video with ffmpeg
  const outputVideo = path.join(outputDir, `${name}.mp4`);
  console.log(`Creating video: ${outputVideo}`);

  const { execSync } = require('child_process');

  let vfFilters = [];
  if (scaleToWidth && scaleToHeight) {
    vfFilters.push(`scale=${scaleToWidth}:${scaleToHeight}:flags=lanczos`);
    console.log(`Scaling output to ${scaleToWidth}x${scaleToHeight}`);
  }

  const vfArg = vfFilters.length > 0 ? `-vf "${vfFilters.join(',')}"` : '';

  execSync(`ffmpeg -y -framerate ${fps} -i "${frameDir}/frame_%05d.png" ${vfArg} -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p "${outputVideo}"`, {
    stdio: 'inherit'
  });

  console.log(`Video created: ${outputVideo}`);

  // Clean up frames
  fs.rmSync(frameDir, { recursive: true });
  console.log('Cleaned up frames');

  return outputVideo;
}

// Parse command line args
// Usage: node capture-frames.js <type> [--duration <seconds>] [--start <section>] [--end <section>] [--name <name>] [--url <url>] [--port <port>]
const args = process.argv.slice(2);

function getArg(name, defaultValue) {
  const index = args.indexOf(`--${name}`);
  if (index !== -1 && args[index + 1]) {
    return args[index + 1];
  }
  return defaultValue;
}

const type = args[0] || 'desktop';
const duration = parseInt(getArg('duration', '30')) * 1000;
const startSection = getArg('start', null);
const endSection = getArg('end', null);
const customName = getArg('name', null);
const port = getArg('port', '3003');
const customUrl = getArg('url', null);
const customFps = getArg('fps', null);
const smoothMode = args.includes('--smooth');
const segmentsArg = getArg('segments', null);  // e.g., "0,1,2"
const secondsPerSegment = parseInt(getArg('segment-duration', '5'));

let baseUrl = customUrl || `http://localhost:${port}`;

// Add ds_skip=1 to downstream URLs to avoid polluting analytics
if (baseUrl.includes('downstream.') || baseUrl.includes('localhost')) {
  const separator = baseUrl.includes('?') ? '&' : '?';
  baseUrl = `${baseUrl}${separator}ds_skip=1`;
}

const configs = {
  desktop: {
    url: baseUrl,
    width: 1920,
    height: 1080,
    duration,
    fps: 24,
    outputDir: path.join(__dirname, 'showreel'),
    name: customName || 'desktop',
    startSection,
    endSection
  },
  mobile: {
    url: baseUrl,
    width: 390,
    height: 844,
    duration,
    fps: 24,
    outputDir: path.join(__dirname, 'showreel'),
    name: customName || 'mobile',
    startSection,
    endSection
  },
  reels: {
    url: baseUrl,
    width: 430,  // Under 768px breakpoint to trigger mobile layout
    height: 763, // 9:16 ratio at this width
    duration,
    fps: 24,
    outputDir: path.join(__dirname, 'showreel'),
    name: customName || 'reels',
    startSection,
    endSection,
    scaleToWidth: 1080,  // Scale up to final resolution
    scaleToHeight: 1920
  }
};

// Apply custom fps if provided
if (customFps && configs[type]) {
  configs[type].fps = parseInt(customFps);
}

// Apply smooth mode if requested
if (smoothMode && configs[type]) {
  configs[type].smooth = true;
}

if (!configs[type]) {
  console.error(`Unknown type: ${type}. Use 'desktop', 'mobile', or 'reels'.`);
  process.exit(1);
}

captureFrames(configs[type]).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
