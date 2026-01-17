import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-muted hover:text-ink text-sm mb-8 inline-block">
          &larr; Back to Home
        </Link>

        <h1 className="text-4xl md:text-5xl font-serif mb-8">Privacy Policy</h1>
        <p className="text-muted mb-12">Last updated: January 9, 2026</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-serif mb-4">1. Information We Collect</h2>
            <p className="text-muted leading-relaxed mb-4">
              When you use DownStream, we collect the following information:
            </p>
            <ul className="list-disc pl-6 text-muted space-y-2">
              <li><strong className="text-ink">Email address:</strong> For order confirmation and delivery</li>
              <li><strong className="text-ink">Story text:</strong> The content you submit for transformation</li>
              <li><strong className="text-ink">Story title:</strong> To identify your stream</li>
              <li><strong className="text-ink">Style preference:</strong> Your chosen visual style</li>
              <li><strong className="text-ink">Payment information:</strong> Processed securely by Stripe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">2. How We Use Your Information</h2>
            <p className="text-muted leading-relaxed mb-4">Your information is used to:</p>
            <ul className="list-disc pl-6 text-muted space-y-2">
              <li>Create your visual story experience</li>
              <li>Send order confirmations and delivery notifications</li>
              <li>Respond to support inquiries</li>
              <li>Process payments (via Stripe)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">3. AI Processing Disclosure</h2>
            <p className="text-muted leading-relaxed mb-4">
              <strong className="text-ink">Important:</strong> Your data is processed by AI systems
              operated by third parties:
            </p>
            <ul className="list-disc pl-6 text-muted space-y-2">
              <li>
                <strong className="text-ink">Anthropic (Claude):</strong> Your story text and support
                emails are processed by Claude AI for production planning and customer support.
              </li>
              <li>
                <strong className="text-ink">Google (Gemini):</strong> Production prompts derived from
                your story are processed for video generation.
              </li>
              <li>
                <strong className="text-ink">Replicate:</strong> Visual processing and generation.
              </li>
            </ul>
            <p className="text-muted leading-relaxed mt-4">
              These services have their own privacy policies. We encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">4. Data Retention</h2>
            <p className="text-muted leading-relaxed mb-4">We retain your data as follows:</p>
            <ul className="list-disc pl-6 text-muted space-y-2">
              <li><strong className="text-ink">Story text:</strong> Deleted after production is complete</li>
              <li><strong className="text-ink">Email address:</strong> Retained for 6 months for support purposes</li>
              <li><strong className="text-ink">Support emails:</strong> Retained for 6 months</li>
              <li><strong className="text-ink">Completed streams:</strong> Hosted indefinitely or until you request removal</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">5. Third-Party Services</h2>
            <p className="text-muted leading-relaxed mb-4">We use the following third-party services:</p>
            <ul className="list-disc pl-6 text-muted space-y-2">
              <li><strong className="text-ink">Stripe:</strong> Payment processing</li>
              <li><strong className="text-ink">Resend:</strong> Email delivery</li>
              <li><strong className="text-ink">Vercel:</strong> Website and stream hosting</li>
              <li><strong className="text-ink">GitHub:</strong> Code and job storage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">6. Your Rights</h2>
            <p className="text-muted leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-muted space-y-2">
              <li>Request access to your personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Withdraw consent for processing</li>
            </ul>
            <p className="text-muted leading-relaxed mt-4">
              To exercise these rights, contact us at{' '}
              <a href="mailto:hello@downstream.ink" className="underline hover:text-ink">
                hello@downstream.ink
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">7. Cookies</h2>
            <p className="text-muted leading-relaxed">
              We use essential cookies for website functionality. We do not use tracking or
              advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">8. Data Security</h2>
            <p className="text-muted leading-relaxed">
              We implement appropriate security measures to protect your data, including
              HTTPS encryption, secure API authentication, and access controls.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">9. Contact</h2>
            <p className="text-muted leading-relaxed">
              For privacy-related questions, contact us at{' '}
              <a href="mailto:hello@downstream.ink" className="underline hover:text-ink">
                hello@downstream.ink
              </a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-ink/10">
          <Link href="/" className="text-muted hover:text-ink">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
