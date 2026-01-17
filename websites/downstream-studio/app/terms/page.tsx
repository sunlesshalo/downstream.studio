import styles from '../privacy/privacy.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Downstream Studio',
}

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1>Terms of Service</h1>
        <p className={styles.updated}>Last updated: January 15, 2026</p>

        <section>
          <h2>1. Company Information</h2>
          <p>
            Downstream Studio is operated by <strong>Pine Lines SRL</strong>, a company registered
            in Romania.
          </p>
          <table>
            <tbody>
              <tr>
                <td><strong>Company Name</strong></td>
                <td>PINE LINES SRL</td>
              </tr>
              <tr>
                <td><strong>Unique Registration Code (CUI)</strong></td>
                <td>40670956</td>
              </tr>
              <tr>
                <td><strong>EUID</strong></td>
                <td>ROONRC.J2019000662123</td>
              </tr>
              <tr>
                <td><strong>Registered Office</strong></td>
                <td>Str. Horea 88-90, Ap. 13, Cluj-Napoca, Cluj, 400275, Romania</td>
              </tr>
              <tr>
                <td><strong>Contact Email</strong></td>
                <td>ferencz@pinelines.eu</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>2. Acceptance of Terms</h2>
          <p>
            By accessing or using the Downstream Studio website (downstream.studio) and services,
            you agree to be bound by these Terms of Service. If you do not agree to these terms,
            please do not use our website or services.
          </p>
          <p>
            These terms constitute a legally binding agreement between you ("Client", "you", "your")
            and Pine Lines SRL ("Company", "we", "us", "our") governing your use of our website
            and visual storytelling services.
          </p>
        </section>

        <section>
          <h2>3. Description of Services</h2>
          <p>
            Downstream Studio provides scroll-driven visual storytelling services ("Streams").
            We transform written content into interactive, animated visual experiences that
            synchronize with the reader's scroll position.
          </p>
          <p>Our services include:</p>
          <ul>
            <li>Visual design and artistic direction</li>
            <li>AI-assisted image and animation generation</li>
            <li>Technical development and deployment</li>
            <li>Hosting on our platform (yourstory.downstream.studio)</li>
            <li>Embed code for integration into client websites</li>
          </ul>
        </section>

        <section>
          <h2>4. AI-Generated Content Disclosure</h2>
          <p>
            <strong>Important:</strong> Unless otherwise explicitly agreed in writing, all visual
            elements in your Stream (images, animations, visual effects) are generated using
            artificial intelligence (AI) technologies.
          </p>
          <p>
            By using our services, you acknowledge and agree that:
          </p>
          <ul>
            <li>
              <strong>AI Generation:</strong> Visual content is created using AI image generation
              and AI video generation models. This includes keyframe images, animations, and
              transitions.
            </li>
            <li>
              <strong>Inherent Variability:</strong> AI-generated content has inherent randomness
              and variability. While we provide artistic direction and quality control, exact
              visual outcomes cannot be guaranteed or precisely replicated.
            </li>
            <li>
              <strong>No Perfect Replication:</strong> Due to the nature of generative AI, it is
              not possible to recreate identical visuals. Each generation produces unique results,
              even with similar prompts.
            </li>
            <li>
              <strong>Human Oversight:</strong> All AI-generated content undergoes human review
              and artistic direction. We curate and refine outputs to match your story's tone
              and requirements.
            </li>
            <li>
              <strong>Alternative Arrangements:</strong> If you require non-AI-generated visuals
              (e.g., using your own photography, commissioned artwork, or stock imagery), this
              must be agreed upon in writing before project commencement and may affect pricing.
            </li>
          </ul>
        </section>

        <section>
          <h2>5. Client Responsibilities</h2>
          <p>As a client, you agree to:</p>
          <ul>
            <li>
              Provide accurate and complete information in your application and throughout the
              project
            </li>
            <li>
              Submit original written content that you have the right to use, or properly
              licensed/attributed content
            </li>
            <li>
              Not submit content that is illegal, defamatory, infringing, or violates any
              third-party rights
            </li>
            <li>
              Respond to communications and provide feedback within reasonable timeframes
            </li>
            <li>
              Pay agreed fees according to the payment schedule
            </li>
          </ul>
        </section>

        <section>
          <h2>6. Intellectual Property</h2>
          <h3>Your Content</h3>
          <p>
            You retain all rights to the written content (text, story, narrative) you provide
            to us. By submitting content, you grant us a license to use it solely for the
            purpose of creating your Stream.
          </p>

          <h3>Delivered Work</h3>
          <p>
            Upon full payment, you receive a perpetual, non-exclusive license to use your
            completed Stream for any purpose, including commercial use, embedding on websites,
            and sharing publicly.
          </p>

          <h3>Our Rights</h3>
          <p>
            We retain the right to use your completed Stream (with your written content) in
            our portfolio, marketing materials, and as demonstration examples, unless you
            request otherwise in writing before project completion.
          </p>

          <h3>AI-Generated Content</h3>
          <p>
            Ownership and licensing of AI-generated visual content is subject to the terms
            of the AI services used in creation. We warrant that we have the necessary rights
            and licenses to deliver the work to you for the purposes described above.
          </p>
        </section>

        <section>
          <h2>7. Payment Terms</h2>
          <ul>
            <li>
              <strong>Beta Pricing:</strong> Founding beta pricing ($497 USD) is valid for
              the first 10 clients and may change without notice.
            </li>
            <li>
              <strong>Payment Schedule:</strong> Full payment is due upon acceptance into
              the beta program, before work begins.
            </li>
            <li>
              <strong>Refunds:</strong> If we cannot deliver a Stream that meets reasonable
              quality standards, you are entitled to a full refund. Refund requests must be
              made before final delivery approval.
            </li>
            <li>
              <strong>Revisions:</strong> One round of revisions is included. Additional
              revisions may incur extra charges.
            </li>
          </ul>
        </section>

        <section>
          <h2>8. Delivery and Acceptance</h2>
          <p>
            We aim to deliver completed Streams within 5-7 business days of receiving your
            final content. Delivery timelines are estimates and not guarantees.
          </p>
          <p>
            Upon delivery, you will have 7 days to review and request your included revision.
            If no feedback is received within 14 days of delivery, the project is considered
            accepted.
          </p>
        </section>

        <section>
          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law:
          </p>
          <ul>
            <li>
              Our total liability for any claim arising from these terms or our services shall
              not exceed the amount you paid for the specific service giving rise to the claim.
            </li>
            <li>
              We are not liable for any indirect, incidental, special, consequential, or
              punitive damages, including loss of profits, data, or business opportunities.
            </li>
            <li>
              We do not guarantee uninterrupted availability of hosted Streams. While we strive
              for high availability, temporary outages may occur.
            </li>
          </ul>
        </section>

        <section>
          <h2>10. Disclaimer of Warranties</h2>
          <p>
            Our services are provided "as is" and "as available." We make no warranties,
            express or implied, regarding:
          </p>
          <ul>
            <li>The specific visual appearance of AI-generated content</li>
            <li>Fitness for a particular purpose</li>
            <li>Non-infringement of third-party rights by AI-generated content</li>
            <li>Continuous, uninterrupted access to hosted Streams</li>
          </ul>
        </section>

        <section>
          <h2>11. Termination</h2>
          <p>
            Either party may terminate the service agreement:
          </p>
          <ul>
            <li>By mutual written agreement</li>
            <li>If the other party materially breaches these terms and fails to remedy the
            breach within 14 days of written notice</li>
          </ul>
          <p>
            Upon termination, you retain rights to any work already delivered and paid for.
            We retain the right to remove hosted Streams if payment obligations are not met.
          </p>
        </section>

        <section>
          <h2>12. Governing Law and Jurisdiction</h2>
          <p>
            These terms are governed by the laws of Romania. Any disputes shall be resolved
            in the competent courts of Bucharest, Romania.
          </p>
          <p>
            For EU consumers, this does not affect your statutory rights under mandatory
            consumer protection laws of your country of residence.
          </p>
        </section>

        <section>
          <h2>13. Consumer Protection (EU/Romania)</h2>
          <p>
            In accordance with Romanian and EU consumer protection regulations:
          </p>
          <ul>
            <li>
              <strong>Right of Withdrawal:</strong> For digital services, the right of
              withdrawal expires once the service has been fully performed, if performance
              began with your prior express consent and acknowledgment that you lose your
              right of withdrawal.
            </li>
            <li>
              <strong>Dispute Resolution:</strong> For disputes, you may contact the
              National Authority for Consumer Protection (ANPC) at{' '}
              <a href="https://anpc.ro" target="_blank" rel="noopener noreferrer">anpc.ro</a>
            </li>
            <li>
              <strong>Online Dispute Resolution:</strong> EU consumers may also use the
              European Online Dispute Resolution platform at{' '}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
                ec.europa.eu/consumers/odr
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2>14. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Material changes will be communicated
            via email or website notice. Continued use of our services after changes constitutes
            acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2>15. Contact</h2>
          <p>
            For questions about these terms, contact us at:
          </p>
          <p>
            <strong>Email:</strong> ferencz@pinelines.eu<br />
            <strong>Company:</strong> PINE LINES SRL<br />
            <strong>CUI:</strong> 40670956<br />
            <strong>Address:</strong> Str. Horea 88-90, Ap. 13, Cluj-Napoca, Cluj, 400275, Romania
          </p>
        </section>

        <div className={styles.backLink}>
          <a href="/">Back to Home</a>
        </div>
      </div>
    </div>
  )
}
