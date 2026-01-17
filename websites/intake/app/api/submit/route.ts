import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { title, language, text, source, brief, client } = body

    // Validation
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Text content is required' }, { status: 400 })
    }

    const wordCount = countWords(text)
    if (wordCount < 800) {
      return NextResponse.json(
        { error: `Text is too short (${wordCount} words). Minimum 800 words required.` },
        { status: 400 }
      )
    }

    if (wordCount > 3500) {
      return NextResponse.json(
        { error: `Text is too long (${wordCount} words). Maximum 3500 words.` },
        { status: 400 }
      )
    }

    // Generate stream ID
    const streamId = slugify(title)

    if (!streamId) {
      return NextResponse.json({ error: 'Could not generate valid stream ID from title' }, { status: 400 })
    }

    // Build input object
    const input: any = {
      id: streamId,
      title: title.trim(),
      language: language || 'en',
      text: text.trim(),
      created_at: new Date().toISOString(),
    }

    // Add optional fields
    if (source?.filename) {
      input.source = {
        filename: source.filename,
        format: source.format,
        uploaded_at: new Date().toISOString(),
      }
    }

    // Clean up brief - remove undefined values
    if (brief) {
      const cleanBrief: any = {}
      if (brief.tone?.length > 0) cleanBrief.tone = brief.tone
      if (brief.style?.length > 0) cleanBrief.style = brief.style
      if (brief.colors) cleanBrief.colors = brief.colors
      if (brief.references) cleanBrief.references = brief.references
      if (brief.notes) cleanBrief.notes = brief.notes

      if (Object.keys(cleanBrief).length > 0) {
        input.brief = cleanBrief
      }
    }

    // Clean up client info
    if (client?.name || client?.email) {
      input.client = {}
      if (client.name) input.client.name = client.name
      if (client.email) input.client.email = client.email
    }

    // Create streams directory path
    const projectRoot = path.resolve(process.cwd(), '..')
    const streamDir = path.join(projectRoot, 'streams', streamId)

    // Create directory if it doesn't exist
    await fs.mkdir(streamDir, { recursive: true })

    // Write input.json
    const inputPath = path.join(streamDir, 'input.json')
    await fs.writeFile(inputPath, JSON.stringify(input, null, 2))

    console.log(`Created input.json at: ${inputPath}`)

    return NextResponse.json({
      success: true,
      streamId,
      inputPath: `streams/${streamId}/input.json`,
    })
  } catch (error: any) {
    console.error('Submit error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
