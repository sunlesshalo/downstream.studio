import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs/promises'

const projectRoot = path.resolve(process.cwd(), '..')

interface ProductionStatus {
  stage: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  message?: string
  error?: string
}

async function runCommand(
  command: string,
  args: string[],
  onOutput?: (data: string) => void
): Promise<{ success: boolean; output: string; error: string }> {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      cwd: projectRoot,
      env: { ...process.env, PATH: `${projectRoot}/.venv/bin:${process.env.PATH}` },
    })

    let output = ''
    let error = ''

    proc.stdout.on('data', (data) => {
      const str = data.toString()
      output += str
      if (onOutput) onOutput(str)
    })

    proc.stderr.on('data', (data) => {
      error += data.toString()
    })

    proc.on('close', (code) => {
      resolve({
        success: code === 0,
        output,
        error,
      })
    })

    proc.on('error', (err) => {
      resolve({
        success: false,
        output,
        error: err.message,
      })
    })
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { streamId, skipAssets, skipApp } = body

    if (!streamId) {
      return NextResponse.json({ error: 'streamId is required' }, { status: 400 })
    }

    const streamDir = path.join(projectRoot, 'streams', streamId)
    const inputPath = path.join(streamDir, 'input.json')
    const productionPath = path.join(streamDir, 'production.json')

    // Check if input.json exists
    try {
      await fs.access(inputPath)
    } catch {
      return NextResponse.json(
        { error: `input.json not found for stream: ${streamId}` },
        { status: 404 }
      )
    }

    // Check if production.json exists
    let hasProductionSpec = false
    try {
      await fs.access(productionPath)
      hasProductionSpec = true
    } catch {
      // production.json doesn't exist yet
    }

    if (!hasProductionSpec) {
      return NextResponse.json(
        {
          error: 'production.json not found. Run create-production-spec skill first.',
          streamId,
          inputExists: true,
          productionExists: false,
          nextStep: 'Run the create-production-spec skill to generate production.json',
        },
        { status: 400 }
      )
    }

    const results: ProductionStatus[] = []

    // Stage 1: Generate assets (keyframes, videos, frames)
    if (!skipAssets) {
      console.log(`[${streamId}] Starting asset generation...`)
      results.push({ stage: 'assets', status: 'running', message: 'Generating keyframes, videos, and frames...' })

      const assetsResult = await runCommand(
        'python3',
        ['execution/produce_stream.py', '--stream-id', streamId]
      )

      if (!assetsResult.success) {
        results[results.length - 1] = {
          stage: 'assets',
          status: 'failed',
          error: assetsResult.error || 'Asset generation failed',
        }
        return NextResponse.json({
          success: false,
          streamId,
          results,
          error: 'Asset generation failed',
          details: assetsResult.error,
        })
      }

      results[results.length - 1] = {
        stage: 'assets',
        status: 'completed',
        message: 'Assets generated successfully',
      }
    }

    // Stage 2: Generate Next.js app
    if (!skipApp) {
      console.log(`[${streamId}] Generating Next.js app...`)
      results.push({ stage: 'app', status: 'running', message: 'Generating Next.js app...' })

      const appResult = await runCommand(
        'python3',
        ['execution/generate_app.py', '--stream-id', streamId]
      )

      if (!appResult.success) {
        results[results.length - 1] = {
          stage: 'app',
          status: 'failed',
          error: appResult.error || 'App generation failed',
        }
        return NextResponse.json({
          success: false,
          streamId,
          results,
          error: 'App generation failed',
          details: appResult.error,
        })
      }

      results[results.length - 1] = {
        stage: 'app',
        status: 'completed',
        message: 'Next.js app generated successfully',
      }
    }

    return NextResponse.json({
      success: true,
      streamId,
      results,
      appPath: `stream-${streamId}`,
      nextSteps: [
        `cd stream-${streamId} && npm run dev`,
        `cd stream-${streamId} && vercel`,
      ],
    })
  } catch (error: any) {
    console.error('Production error:', error)
    return NextResponse.json(
      { error: error.message || 'Production failed' },
      { status: 500 }
    )
  }
}

// GET endpoint to check status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const streamId = searchParams.get('streamId')

  if (!streamId) {
    return NextResponse.json({ error: 'streamId is required' }, { status: 400 })
  }

  const streamDir = path.join(projectRoot, 'streams', streamId)
  const appDir = path.join(projectRoot, `stream-${streamId}`)

  const status: any = {
    streamId,
    input: false,
    production: false,
    keyframes: 0,
    videos: 0,
    frames: 0,
    app: false,
  }

  try {
    await fs.access(path.join(streamDir, 'input.json'))
    status.input = true
  } catch {}

  try {
    await fs.access(path.join(streamDir, 'production.json'))
    status.production = true
  } catch {}

  try {
    const keyframes = await fs.readdir(path.join(streamDir, 'keyframes'))
    status.keyframes = keyframes.filter((f) => f.endsWith('.jpg')).length
  } catch {}

  try {
    const videos = await fs.readdir(path.join(streamDir, 'videos'))
    status.videos = videos.filter((f) => f.endsWith('.mp4')).length
  } catch {}

  try {
    const framesDir = path.join(streamDir, 'public', 'frames')
    const segments = await fs.readdir(framesDir)
    let totalFrames = 0
    for (const seg of segments) {
      try {
        const frames = await fs.readdir(path.join(framesDir, seg))
        totalFrames += frames.filter((f) => f.endsWith('.webp')).length
      } catch {}
    }
    status.frames = totalFrames
  } catch {}

  try {
    await fs.access(path.join(appDir, 'package.json'))
    status.app = true
  } catch {}

  return NextResponse.json(status)
}
