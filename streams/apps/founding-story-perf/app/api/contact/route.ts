import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Initialize clients (only if env vars are set)
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'hello@downstream.ink'
const FROM_EMAIL = process.env.FROM_EMAIL || 'DownStream <hello@downstream.ink>'
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, story, streamId, timestamp } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Store in Supabase if configured
    if (supabase) {
      const { error: dbError } = await supabase
        .from('stream_leads')
        .insert({
          name,
          email,
          story: story || null,
          stream_id: streamId,
          created_at: timestamp || new Date().toISOString(),
          source: 'stream_contact_form'
        })

      if (dbError) {
        console.error('Supabase error:', dbError)
        // Don't fail the request, just log the error
      }
    }

    // Send email notification if configured
    if (resend) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: NOTIFY_EMAIL,
          subject: `New Stream Interest: ${name}`,
          html: `
            <h2>New Lead from ${streamId}</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${story ? `<p><strong>Their story:</strong></p><p>${story}</p>` : ''}
            <p><small>Submitted at ${timestamp || new Date().toISOString()}</small></p>
          `
        })
      } catch (emailError) {
        console.error('Email error:', emailError)
        // Don't fail the request, just log the error
      }
    }

    // Send Discord notification (primary notification method)
    if (DISCORD_WEBHOOK_URL) {
      try {
        const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: '🎯 New Stream Lead',
              color: 5763719, // green
              fields: [
                { name: 'Name', value: name, inline: true },
                { name: 'Email', value: email, inline: true },
                { name: 'Stream', value: streamId || 'unknown', inline: true },
                ...(story ? [{ name: 'Their Story', value: story.substring(0, 500) + (story.length > 500 ? '...' : ''), inline: false }] : [])
              ],
              timestamp: new Date().toISOString()
            }]
          })
        })

        if (!discordResponse.ok) {
          console.error('Discord API error:', discordResponse.status)
        }
      } catch (discordErr) {
        console.error('Discord notification error:', discordErr)
      }
    } else {
      console.warn('DISCORD_WEBHOOK_URL not configured')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
