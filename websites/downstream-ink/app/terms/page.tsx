import Link from 'next/link'

export default function TermsOfService() {
  return (
    <main className="min-h-screen py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-muted hover:text-ink text-sm mb-8 inline-block">
          &larr; Back to Home
        </Link>

        <h1 className="text-4xl md:text-5xl font-serif mb-8">Terms of Service</h1>
        <p className="text-muted mb-12">Last updated: January 9, 2026</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-serif mb-4">1. Service Description</h2>
            <p className="text-muted leading-relaxed">
              DownStream (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) provides a service that transforms written stories
              into scroll-driven visual experiences. By using our service, you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">2. AI-Generated Content Disclosure</h2>
            <p className="text-muted leading-relaxed mb-4">
              <strong className="text-ink">Important:</strong> DownStream uses artificial intelligence (AI)
              technology throughout our service. By using DownStream, you acknowledge and agree to the following:
            </p>
            <ul className="list-disc pl-6 text-muted space-y-2">
              <li>
                <strong className="text-ink">Visual Content Generation:</strong> All visual content (images, videos,
                animations) in your stream is generated using AI technology, including but not limited to
                Google Gemini and other AI models.
              </li>
              <li>
                <strong className="text-ink">Production Planning:</strong> AI systems (Claude by Anthropic) analyze
                your story text to create production specifications and visual directions.
              </li>
              <li>
                <strong className="text-ink">Customer Support:</strong> Email responses may be drafted by AI and will
                identify themselves as such (signed &quot;Claude at DownStream&quot;). Human oversight is available for
                complex issues.
              </li>
              <li>
                <strong className="text-ink">Business Operations:</strong> This business is transparently AI-operated,
                with human oversight provided by the owner for legal, financial, and escalated matters.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">3. Content Ownership and Rights</h2>
            <p className="text-muted leading-relaxed mb-4">
              <strong className="text-ink">Your Story:</strong> You retain all rights to your original story text.
              By submitting your story, you grant us a license to process it through our AI systems for the
              purpose of creating your visual experience.
            </p>
            <p className="text-muted leading-relaxed">
              <strong className="text-ink">Generated Content:</strong> The AI-generated visual content is created
              specifically for your stream. You receive a license to use, share, and display your completed
              stream for personal and promotional purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">4. Acceptable Use</h2>
            <p className="text-muted leading-relaxed mb-4">You agree not to submit content that:</p>
            <ul className="list-disc pl-6 text-muted space-y-2">
              <li>Infringes on intellectual property rights of others</li>
              <li>Contains illegal, harmful, or offensive material</li>
              <li>Attempts to manipulate or exploit our AI systems</li>
              <li>Violates any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">5. Pricing and Payment</h2>
            <p className="text-muted leading-relaxed">
              The service is priced at &euro;49 per stream. Payment is processed securely through Stripe.
              All sales are final once production begins. Refunds may be considered on a case-by-case basis
              for technical issues.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">6. Delivery</h2>
            <p className="text-muted leading-relaxed">
              Your completed stream will be delivered to your email as a hosted link. Delivery times vary
              based on story complexity but typically range from 24-72 hours. Your stream will be hosted
              on our infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">7. AI Limitations and Disclaimers</h2>
            <p className="text-muted leading-relaxed mb-4">
              AI-generated content may have limitations:
            </p>
            <ul className="list-disc pl-6 text-muted space-y-2">
              <li>Visual interpretations may differ from your imagination</li>
              <li>AI systems may occasionally produce unexpected results</li>
              <li>We cannot guarantee specific visual outcomes</li>
              <li>AI support responses, while helpful, should not be considered professional advice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">8. Data Processing</h2>
            <p className="text-muted leading-relaxed">
              Your story text and email are processed through third-party AI services (Anthropic, Google)
              for the purpose of creating your stream and providing support. Please review our
              <Link href="/privacy" className="underline hover:text-ink"> Privacy Policy</Link> for details
              on data handling.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">9. EU AI Act Compliance</h2>
            <p className="text-muted leading-relaxed">
              In compliance with the European Union AI Act, we disclose that our service uses AI systems
              for content generation. AI-generated content includes machine-readable metadata indicating
              its artificial origin. We maintain documentation of our AI systems and their intended uses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">10. Contact</h2>
            <p className="text-muted leading-relaxed">
              For questions about these terms or our AI practices, contact us at{' '}
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
