import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Stripe webhook for payment events
// Creates order jobs in GitHub repo for Hetzner to process

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    let event: Stripe.Event

    try {
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
      } else {
        console.warn('STRIPE_WEBHOOK_SECRET not set - parsing without verification')
        event = JSON.parse(rawBody) as Stripe.Event
      }
    } catch (err) {
      console.error('Webhook signature verification failed:', err instanceof Error ? err.message : err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    console.log('Stripe webhook received:', event.type)

    // Handle checkout completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Idempotency check: Use Stripe event ID to prevent duplicate processing
      const idempotencyKey = event.id
      const githubToken = process.env.GITHUB_TOKEN

      if (githubToken) {
        try {
          // Check if we've already processed this event
          const checkResponse = await fetch(
            `https://api.github.com/repos/sunlesshalo/downstream.ink/contents/infrastructure/jobs/.processed/${idempotencyKey}`,
            {
              headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
              },
            }
          )
          if (checkResponse.ok) {
            console.log(`Duplicate webhook detected, already processed: ${idempotencyKey}`)
            return NextResponse.json({ status: 'ok', message: 'already processed' })
          }
        } catch {
          // File doesn't exist, continue processing
        }
      }

      // Extract order details from metadata
      const metadata = session.metadata || {}
      const customerEmail = session.customer_details?.email || metadata.email
      const streamTitle = metadata.stream_title || 'Untitled Stream'
      const streamId = metadata.stream_id || `stream-${Date.now()}`

      // Fetch the full story from awaiting-payment file in GitHub
      let storyText = ''
      let stylePreference = metadata.style_preference || 'art-film'

      if (githubToken && streamId) {
        try {
          const awaitingResponse = await fetch(
            `https://api.github.com/repos/sunlesshalo/downstream.ink/contents/infrastructure/jobs/awaiting-payment/${streamId}.json`,
            {
              headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
              },
            }
          )

          if (awaitingResponse.ok) {
            const fileData = await awaitingResponse.json()
            const pendingData = JSON.parse(Buffer.from(fileData.content, 'base64').toString())
            storyText = pendingData.story || ''
            stylePreference = pendingData.style || stylePreference

            // Delete the awaiting-payment file (payment complete)
            await fetch(
              `https://api.github.com/repos/sunlesshalo/downstream.ink/contents/infrastructure/jobs/awaiting-payment/${streamId}.json`,
              {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${githubToken}`,
                  'Content-Type': 'application/json',
                  'Accept': 'application/vnd.github.v3+json',
                },
                body: JSON.stringify({
                  message: `[webhook:stripe] Payment complete, removing awaiting-payment file`,
                  sha: fileData.sha,
                  branch: 'main',
                }),
              }
            )
          } else {
            console.warn(`Could not fetch awaiting-payment file for ${streamId}`)
          }
        } catch (err) {
          console.error('Error fetching story from GitHub:', err)
        }
      }

      const jobId = `order-${Date.now()}`

      const job = {
        type: 'new-order',
        id: jobId,
        created_at: new Date().toISOString(),
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent,
        customer_email: customerEmail,
        amount_paid: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency,
        stream_id: streamId,
        stream_title: streamTitle,
        story_text: storyText,
        style_preference: stylePreference,
      }

      // Create job file in GitHub repo
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
            message: `[webhook:stripe] New order from ${customerEmail}`,
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

      console.log(`Created order job: ${jobId} for ${customerEmail}`)

      // Mark this event as processed (idempotency)
      try {
        const processedContent = Buffer.from(JSON.stringify({
          event_id: idempotencyKey,
          job_id: jobId,
          processed_at: new Date().toISOString(),
        })).toString('base64')

        await fetch(
          `https://api.github.com/repos/sunlesshalo/downstream.ink/contents/infrastructure/jobs/.processed/${idempotencyKey}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({
              message: `[webhook:stripe] Mark event processed: ${idempotencyKey}`,
              content: processedContent,
              branch: 'main',
            }),
          }
        )
      } catch (err) {
        console.warn('Could not create idempotency marker:', err)
        // Non-fatal, continue
      }

      // Notify Discord about new order
      const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL
      if (discordWebhookUrl) {
        try {
          await fetch(discordWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              embeds: [{
                title: 'New Order',
                color: 3066993, // green
                fields: [
                  { name: 'Customer', value: customerEmail || 'Unknown', inline: true },
                  { name: 'Amount', value: `€${job.amount_paid}`, inline: true },
                  { name: 'Stream', value: streamTitle, inline: false },
                  { name: 'Order ID', value: `\`${jobId}\``, inline: false },
                ],
                timestamp: new Date().toISOString()
              }]
            })
          })
          console.log('Discord notification sent')
        } catch (discordErr) {
          console.error('Failed to send Discord notification:', discordErr)
        }
      }

      // Send confirmation email via Resend
      const resendApiKey = process.env.RESEND_API_KEY
      if (resendApiKey && customerEmail) {
        try {
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'DownStream <hello@downstream.ink>',
              to: [customerEmail],
              subject: `Order Confirmed: "${streamTitle}"`,
              html: `
                <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                  <h1 style="font-size: 24px; margin-bottom: 24px;">Thank you for your order!</h1>

                  <p style="font-size: 16px; line-height: 1.6; color: #333;">
                    We've received your order for <strong>"${streamTitle}"</strong> and our team is now working on bringing your story to life.
                  </p>

                  <p style="font-size: 16px; line-height: 1.6; color: #333;">
                    You'll receive another email when your scroll-driven experience is ready to view.
                  </p>

                  <div style="margin: 32px 0; padding: 20px; background: #f5f5f5; border-radius: 8px;">
                    <p style="margin: 0; font-size: 14px; color: #666;">
                      <strong>Order ID:</strong> ${jobId}<br>
                      <strong>Amount:</strong> €${job.amount_paid}
                    </p>
                  </div>

                  <p style="font-size: 14px; color: #666;">
                    Questions? Just reply to this email — we're happy to help.
                  </p>

                  <p style="font-size: 14px; color: #999; margin-top: 40px;">
                    — Claude at DownStream<br>
                    <em>(Yes, this business is AI-operated. We're transparent about that.)</em>
                  </p>
                </div>
              `,
            }),
          })

          if (emailResponse.ok) {
            console.log('Confirmation email sent to:', customerEmail)
          } else {
            console.error('Failed to send confirmation email:', await emailResponse.text())
          }
        } catch (emailErr) {
          console.error('Error sending confirmation email:', emailErr)
        }
      }

      return NextResponse.json({ status: 'ok', job_id: jobId })
    }

    // Handle other events we care about
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('Payment failed:', paymentIntent.id)
      // Could create a job to notify customer or log for review
    }

    return NextResponse.json({ status: 'ok', event: event.type })

  } catch (error) {
    console.error('Webhook error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Stripe may send GET for verification
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'downstream-stripe-webhook' })
}
