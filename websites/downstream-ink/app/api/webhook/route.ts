import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { readFile, writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'

// Lazy initialization to avoid build-time errors
let stripe: Stripe | null = null
function getStripe() {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia',
    })
  }
  return stripe
}

// Directories
const PENDING_DIR = process.env.PENDING_DIR || '../data/pending'
const JOBS_DIR = process.env.JOBS_DIR || '../infrastructure/jobs'
const STREAMS_DIR = process.env.STREAMS_DIR || '../pipeline/streams'

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const streamId = session.metadata?.stream_id
    const email = session.customer_email

    if (!streamId) {
      console.error('No stream_id in session metadata')
      return NextResponse.json({ error: 'Missing stream_id' }, { status: 400 })
    }

    try {
      // Read the pending submission with full story content
      const pendingPath = join(PENDING_DIR, `${streamId}.json`)
      const pendingData = JSON.parse(await readFile(pendingPath, 'utf-8'))

      // Create the stream directory and input.json for the pipeline
      const streamDir = join(STREAMS_DIR, streamId)
      await mkdir(streamDir, { recursive: true })

      const inputData = {
        title: pendingData.title,
        story: pendingData.story,
        style: pendingData.style,
        customer_email: email,
        created_at: pendingData.created_at,
      }
      await writeFile(
        join(streamDir, 'input.json'),
        JSON.stringify(inputData, null, 2)
      )

      // Create job file for Claude Code to process
      const job = {
        stream_id: streamId,
        customer_email: email,
        title: pendingData.title,
        style: pendingData.style,
        paid_amount: session.amount_total ? session.amount_total / 100 : 49,
        paid_at: new Date().toISOString(),
        stripe_session_id: session.id,
        input_path: join(streamDir, 'input.json'),
        status: 'pending',
      }

      // Ensure jobs pending directory exists
      const jobsPendingDir = join(JOBS_DIR, 'pending')
      await mkdir(jobsPendingDir, { recursive: true })

      // Write job file
      const jobPath = join(jobsPendingDir, `${streamId}.json`)
      await writeFile(jobPath, JSON.stringify(job, null, 2))

      // Clean up pending file
      await unlink(pendingPath).catch(() => {})

      console.log(`Job created: ${jobPath}`)
    } catch (err) {
      console.error('Failed to process payment:', err)
      // Don't fail the webhook — payment succeeded, we'll handle job creation manually if needed
    }
  }

  return NextResponse.json({ received: true })
}
