import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

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

// ============================================
// INPUT VALIDATION
// ============================================

const ALLOWED_STYLES = ['cinematic', 'illustrated', 'minimal', 'expressive'] as const
type StyleType = typeof ALLOWED_STYLES[number]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LENGTH = 254
const MIN_TITLE_LENGTH = 1
const MAX_TITLE_LENGTH = 200
const MIN_STORY_LENGTH = 100
const MAX_STORY_LENGTH = 50000

// Sanitize string: remove HTML tags, trim whitespace
function sanitizeString(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '')    // Remove any remaining angle brackets
    .trim()
}

// Validate and sanitize checkout input
function validateInput(body: unknown): {
  valid: false
  error: string
} | {
  valid: true
  data: { email: string; title: string; story: string; style: StyleType }
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' }
  }

  const { email, title, story, style } = body as Record<string, unknown>

  // Email validation
  if (typeof email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }
  const trimmedEmail = email.trim().toLowerCase()
  if (trimmedEmail.length > MAX_EMAIL_LENGTH) {
    return { valid: false, error: `Email must be under ${MAX_EMAIL_LENGTH} characters` }
  }
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { valid: false, error: 'Invalid email format' }
  }

  // Title validation
  if (typeof title !== 'string') {
    return { valid: false, error: 'Title is required' }
  }
  const sanitizedTitle = sanitizeString(title)
  if (sanitizedTitle.length < MIN_TITLE_LENGTH) {
    return { valid: false, error: 'Title is required' }
  }
  if (sanitizedTitle.length > MAX_TITLE_LENGTH) {
    return { valid: false, error: `Title must be under ${MAX_TITLE_LENGTH} characters` }
  }

  // Story validation
  if (typeof story !== 'string') {
    return { valid: false, error: 'Story is required' }
  }
  const sanitizedStory = sanitizeString(story)
  if (sanitizedStory.length < MIN_STORY_LENGTH) {
    return { valid: false, error: `Story must be at least ${MIN_STORY_LENGTH} characters` }
  }
  if (sanitizedStory.length > MAX_STORY_LENGTH) {
    return { valid: false, error: `Story must be under ${MAX_STORY_LENGTH} characters` }
  }

  // Style validation
  if (typeof style !== 'string') {
    return { valid: false, error: 'Style is required' }
  }
  const normalizedStyle = style.trim().toLowerCase()
  if (!ALLOWED_STYLES.includes(normalizedStyle as StyleType)) {
    return { valid: false, error: `Invalid style. Must be one of: ${ALLOWED_STYLES.join(', ')}` }
  }

  return {
    valid: true,
    data: {
      email: trimmedEmail,
      title: sanitizedTitle,
      story: sanitizedStory,
      style: normalizedStyle as StyleType,
    },
  }
}

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  try {
    const body = await request.json()

    // Validate input
    const validation = validateInput(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { email, title, story, style } = validation.data

    // Generate a unique stream ID
    const streamId = `stream-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    // Store the story in GitHub (Vercel is serverless/read-only)
    // This allows the Stripe webhook to access it after payment
    const githubToken = process.env.GITHUB_TOKEN
    if (!githubToken) {
      console.error('GITHUB_TOKEN not configured')
      return NextResponse.json(
        { error: 'Server misconfigured' },
        { status: 500 }
      )
    }

    const pendingData = {
      stream_id: streamId,
      email,
      title,
      story,
      style,
      created_at: new Date().toISOString(),
      status: 'awaiting_payment',
    }

    const content = Buffer.from(JSON.stringify(pendingData, null, 2)).toString('base64')

    const githubResponse = await fetch(
      `https://api.github.com/repos/sunlesshalo/downstream.ink/contents/infrastructure/jobs/awaiting-payment/${streamId}.json`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          message: `[checkout] Awaiting payment: ${title}`,
          content: content,
          branch: 'main',
        }),
      }
    )

    if (!githubResponse.ok) {
      const error = await githubResponse.text()
      console.error('GitHub API error:', githubResponse.status, error)
      return NextResponse.json(
        { error: 'Failed to save story' },
        { status: 500 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'DownStream Story',
              description: `"${title}" — scroll-driven visual experience`,
            },
            unit_amount: 4900, // €49.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/#start`,
      customer_email: email,
      metadata: {
        stream_id: streamId,
        stream_title: title,
        style_preference: style,
      },
      payment_intent_data: {
        metadata: {
          stream_id: streamId,
        },
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
