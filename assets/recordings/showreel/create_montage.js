#!/usr/bin/env node
/**
 * Create showreel montage from clips.json config
 *
 * Usage: node create_montage.js [clips.json]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const configFile = process.argv[2] || 'clips.json';
const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

const outputDir = path.dirname(configFile);
const tempDir = path.join(outputDir, 'temp_clips');

// Clean and create temp directory
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true });
}
fs.mkdirSync(tempDir, { recursive: true });

console.log('='.repeat(60));
console.log('SHOWREEL MONTAGE CREATOR');
console.log('='.repeat(60));
console.log(`Clips: ${config.clips.length}`);
console.log(`Duration per clip: ${config.clip_duration}s`);
console.log(`Total duration: ${config.clips.length * config.clip_duration}s`);
console.log(`Output: ${config.output}`);
console.log('');

// Extract each clip
const clipFiles = [];
config.clips.forEach((clip, i) => {
  const num = String(i).padStart(2, '0');
  const sourcePath = path.join(outputDir, clip.source);
  const clipPath = path.join(tempDir, `clip_${num}.mp4`);

  console.log(`[${num}] ${clip.source} @ ${clip.start}s - ${clip.note}`);

  // Extract clip with crossfade-friendly format
  execSync(`ffmpeg -y -ss ${clip.start} -i "${sourcePath}" -t ${config.clip_duration} -c:v libx264 -crf 18 -preset fast -pix_fmt yuv420p "${clipPath}"`, {
    stdio: 'pipe'
  });

  clipFiles.push(clipPath);
});

console.log('');
console.log('Clips extracted. Creating montage...');

// Create concat file
const concatFile = path.join(tempDir, 'concat.txt');
const concatContent = clipFiles.map(f => `file '${path.basename(f)}'`).join('\n');
fs.writeFileSync(concatFile, concatContent);

// Concatenate clips
const outputPath = path.join(outputDir, config.output);
const tempOutputPath = path.join(tempDir, config.output);
execSync(`ffmpeg -y -f concat -safe 0 -i "concat.txt" -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p "${config.output}"`, {
  stdio: 'inherit',
  cwd: tempDir
});

// Move output to final location
fs.renameSync(tempOutputPath, outputPath);

console.log('');
console.log('='.repeat(60));
console.log(`MONTAGE CREATED: ${outputPath}`);
console.log('='.repeat(60));

// Get file size
const stats = fs.statSync(outputPath);
const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
console.log(`File size: ${sizeMB} MB`);

// Cleanup temp files
fs.rmSync(tempDir, { recursive: true });
console.log('Cleaned up temp files.');
