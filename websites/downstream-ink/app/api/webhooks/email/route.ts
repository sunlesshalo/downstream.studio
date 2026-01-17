import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'

// Resend webhook for incoming emails
// Creates a support job in GitHub repo for Hetzner to process

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    // Verify webhook signature using official Svix library
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
    let payload: any

    if (webhookSecret) {
      const svixId = request.headers.get('svix-id')
      const svixTimestamp = request.headers.get('svix-timestamp')
      const svixSignature = request.headers.get('svix-signature')

      if (!svixId || !svixTimestamp || !svixSignature) {
        console.error('Missing Svix headers')
        return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 })
      }

      try {
        const wh = new Webhook(webhookSecret)
        payload = wh.verify(rawBody, {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        })
      } catch (err) {
        console.error('Webhook signature verification failed:', err instanceof Error ? err.message : err)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    } else {
      console.warn('RESEND_WEBHOOK_SECRET not set - skipping signature verification')
      payload = JSON.parse(rawBody)
    }

    // Verify this is an email.received event
    if (payload.type !== 'email.received') {
      return NextResponse.json({ status: 'ignored', reason: 'not email.received' })
    }

    const webhookEmail = payload.data
    const emailId = webhookEmail?.email_id

    // Idempotency check: Use email_id to prevent duplicate processing
    const githubToken = process.env.GITHUB_TOKEN
    if (githubToken && emailId) {
      try {
        const checkResponse = await fetch(
          `https://api.github.com/repos/sunlesshalo/downstream.ink/contents/infrastructure/jobs/.processed/email-${emailId}`,
          {
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        )
        if (checkResponse.ok) {
          console.log(`Duplicate webhook detected, already processed: email-${emailId}`)
          return NextResponse.json({ status: 'ok', message: 'already processed' })
        }
      } catch {
        // File doesn't exist, continue processing
      }
    }

    // Fetch full email content from Resend API
    // The webhook only sends metadata, not the body
    let fullEmail = webhookEmail
    const resendApiKey = process.env.RESEND_API_KEY

    if (resendApiKey && emailId) {
      try {
        const emailResponse = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
          },
        })
        if (emailResponse.ok) {
          fullEmail = await emailResponse.json()
          console.log('Fetched full email content for:', emailId)
        } else {
          console.warn('Could not fetch full email, using webhook data:', emailResponse.status)
        }
      } catch (err) {
        console.warn('Error fetching full email:', err)
      }
    }

    const jobId = `support-${Date.now()}`

    const job = {
      type: 'support-email',
      id: jobId,
      email_id: emailId,
      created_at: new Date().toISOString(),
      from: fullEmail?.from,
      to: fullEmail?.to,
      subject: fullEmail?.subject,
      text: fullEmail?.text,
      html: fullEmail?.html,
      message_id: fullEmail?.message_id,
      in_reply_to: fullEmail?.in_reply_to,
    }

    // Create job file in GitHub repo (githubToken already defined above for idempotency check)
    if (!githubToken) {
      console.error('GITHUB_TOKEN not configured')
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    const content = Buffer.from(JSON.stringify(job, null, 2)).toString('base64')

    const response = await fetch(
      `https://api.github.com/repos/sunlesshalo/downstream.ink/contents/infrastructure/jobs/pending/${jobId}.json`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          message: `[webhook:email] New support email from ${fullEmail?.from}`,
          content: content,
          branch: 'main',
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('GitHub API error:', response.status, error)
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
    }

    console.log(`Created support job: ${jobId}`)

    // Mark this email as processed (idempotency)
    if (emailId) {
      try {
        const processedContent = Buffer.from(JSON.stringify({
          email_id: emailId,
          job_id: jobId,
          processed_at: new Date().toISOString(),
        })).toString('base64')

        await fetch(
          `https://api.github.com/repos/sunlesshalo/downstream.ink/contents/infrastructure/jobs/.processed/email-${emailId}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({
              message: `[webhook:email] Mark email processed: ${emailId}`,
              content: processedContent,
              branch: 'main',
            }),
          }
        )
      } catch (err) {
        console.warn('Could not create idempotency marker:', err)
        // Non-fatal, continue
      }
    }

    // Notify Discord about support email
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (discordWebhookUrl) {
      try {
        // Clean and truncate preview text for Discord
        const rawPreview = fullEmail?.text?.substring(0, 200) || fullEmail?.subject || 'No preview'
        // Remove control characters that could cause Discord API issues
        const preview = rawPreview.replace(/[\x00-\x1F\x7F]/g, ' ').trim()

        const discordResponse = await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: '📧 Support Email',
              color: 15844367, // orange/yellow
              fields: [
                { name: 'From', value: fullEmail?.from || 'Unknown', inline: true },
                { name: 'Subject', value: fullEmail?.subject || 'No subject', inline: false },
                { name: 'Preview', value: preview.length >= 200 ? preview + '...' : preview, inline: false },
              ],
              timestamp: new Date().toISOString()
            }]
          })
        })

        if (!discordResponse.ok) {
          console.error('Discord API error:', discordResponse.status, await discordResponse.text())
        } else {
          console.log('Discord notification sent for support email')
        }
      } catch (discordErr) {
        console.error('Failed to send Discord notification:', discordErr)
      }
    } else {
      console.warn('DISCORD_WEBHOOK_URL not configured - skipping notification')
    }

    return NextResponse.json({ status: 'ok', job_id: jobId })

  } catch (error) {
    console.error('Webhook error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Resend may send GET for verification
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'downstream-email-webhook' })
}
