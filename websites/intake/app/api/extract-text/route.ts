import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileName = file.name.toLowerCase()
    const buffer = Buffer.from(await file.arrayBuffer())

    let text = ''

    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      // Plain text files
      text = buffer.toString('utf-8')
    } else if (fileName.endsWith('.pdf')) {
      // PDF files
      try {
        const pdfParse = require('pdf-parse')
        const data = await pdfParse(buffer)
        text = data.text
      } catch (err: any) {
        console.error('PDF parse error:', err)
        return NextResponse.json(
          { error: 'Failed to parse PDF. Try copying the text directly.' },
          { status: 400 }
        )
      }
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      // Word documents
      try {
        const mammoth = require('mammoth')
        const result = await mammoth.extractRawText({ buffer })
        text = result.value
      } catch (err: any) {
        console.error('DOCX parse error:', err)
        return NextResponse.json(
          { error: 'Failed to parse Word document. Try copying the text directly.' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Use PDF, DOCX, TXT, or MD.' },
        { status: 400 }
      )
    }

    // Clean up the text
    text = text
      .replace(/\r\n/g, '\n')        // Normalize line endings
      .replace(/\n{3,}/g, '\n\n')    // Max 2 consecutive newlines
      .trim()

    if (!text) {
      return NextResponse.json(
        { error: 'Could not extract text from file. Try copying the text directly.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ text })
  } catch (error: any) {
    console.error('Extract text error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process file' },
      { status: 500 }
    )
  }
}
