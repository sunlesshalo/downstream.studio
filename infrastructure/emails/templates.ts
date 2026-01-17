// Email templates for DownStream
// Used by production pipeline and support scripts

export const templates = {
  // Sent when stream is deployed and ready
  streamReady: (data: {
    customerEmail: string
    streamTitle: string
    streamUrl: string
    orderId: string
  }) => ({
    to: data.customerEmail,
    subject: `Your story is live: "${data.streamTitle}"`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; margin-bottom: 24px;">Your stream is ready!</h1>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Great news — <strong>"${data.streamTitle}"</strong> is now live and ready to share.
        </p>

        <div style="margin: 32px 0;">
          <a href="${data.streamUrl}"
             style="display: inline-block; background: #0a0a0f; color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-size: 16px;">
            View Your Stream →
          </a>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Share this link with anyone — it works on any device with a modern browser.
        </p>

        <div style="margin: 32px 0; padding: 20px; background: #f5f5f5; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>Your stream URL:</strong><br>
            <a href="${data.streamUrl}" style="color: #0066cc;">${data.streamUrl}</a>
          </p>
        </div>

        <p style="font-size: 14px; color: #666;">
          Questions or feedback? Just reply to this email.
        </p>

        <p style="font-size: 14px; color: #999; margin-top: 40px;">
          — Claude at DownStream
        </p>
      </div>
    `,
  }),

  // Sent when production fails - NO automatic refund, escalate to Ferenc
  streamFailed: (data: {
    customerEmail: string
    streamTitle: string
    orderId: string
    errorSummary?: string
  }) => ({
    to: data.customerEmail,
    subject: `Update on your order: "${data.streamTitle}"`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; margin-bottom: 24px;">We hit a snag</h1>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          We encountered an issue while creating <strong>"${data.streamTitle}"</strong> and couldn't complete your stream automatically.
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Don't worry — a human is reviewing your order now. We'll either:
        </p>

        <ul style="font-size: 16px; line-height: 1.8; color: #333;">
          <li>Fix the issue and deliver your stream shortly, or</li>
          <li>Reach out to discuss options (including a full refund)</li>
        </ul>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          We apologize for the delay and will update you within 24 hours.
        </p>

        <div style="margin: 32px 0; padding: 20px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
          <p style="margin: 0; font-size: 14px; color: #856404;">
            <strong>Order ID:</strong> ${data.orderId}<br>
            <strong>Status:</strong> Under review
          </p>
        </div>

        <p style="font-size: 14px; color: #666;">
          Questions? Reply to this email anytime.
        </p>

        <p style="font-size: 14px; color: #999; margin-top: 40px;">
          — Claude at DownStream
        </p>
      </div>
    `,
  }),

  // Internal alert to Ferenc when manual intervention needed
  alertFerenc: (data: {
    type: 'failed_order' | 'refund_request' | 'urgent_support'
    orderId?: string
    customerEmail?: string
    summary: string
    details?: string
  }) => ({
    to: 'ferencz@pinelines.eu',
    subject: `[DownStream Alert] ${data.type}: ${data.summary}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; margin-bottom: 24px; color: #dc3545;">Action Required</h1>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          <strong>Type:</strong> ${data.type}<br>
          ${data.orderId ? `<strong>Order ID:</strong> ${data.orderId}<br>` : ''}
          ${data.customerEmail ? `<strong>Customer:</strong> ${data.customerEmail}<br>` : ''}
        </p>

        <div style="margin: 24px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; color: #333;">
            <strong>Summary:</strong><br>
            ${data.summary}
          </p>
          ${data.details ? `
          <hr style="margin: 16px 0; border: none; border-top: 1px solid #dee2e6;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>Details:</strong><br>
            <pre style="white-space: pre-wrap; font-size: 12px;">${data.details}</pre>
          </p>
          ` : ''}
        </div>

        <p style="font-size: 14px; color: #666;">
          This alert was generated automatically by the DownStream system.
        </p>
      </div>
    `,
  }),

  // Feedback request (sent a few days after delivery)
  feedbackRequest: (data: {
    customerEmail: string
    streamTitle: string
    streamUrl: string
  }) => ({
    to: data.customerEmail,
    subject: `How was "${data.streamTitle}"?`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; margin-bottom: 24px;">Quick check-in</h1>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Hope you've had a chance to see <strong>"${data.streamTitle}"</strong> in action!
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          I'd love to know what you think. Just reply with:
        </p>

        <ul style="font-size: 16px; line-height: 1.8; color: #333;">
          <li>What worked well?</li>
          <li>Anything you'd change?</li>
          <li>Would you recommend DownStream?</li>
        </ul>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Your feedback helps me improve — and yes, I actually read every reply.
        </p>

        <p style="font-size: 14px; color: #999; margin-top: 40px;">
          — Claude at DownStream
        </p>
      </div>
    `,
  }),
}

// Helper to send email via Resend
export async function sendEmail(
  template: { to: string; subject: string; html: string },
  resendApiKey: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DownStream <hello@downstream.ink>',
        to: [template.to],
        subject: template.subject,
        html: template.html,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return { success: true, id: data.id }
    } else {
      const error = await response.text()
      return { success: false, error }
    }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
