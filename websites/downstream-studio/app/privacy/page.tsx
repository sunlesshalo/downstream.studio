import styles from './privacy.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Downstream Studio',
}

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: January 15, 2026</p>

        <section>
          <h2>Who We Are</h2>
          <p>
            Downstream Studio ("we", "us", "our") creates scroll-driven visual storytelling experiences.
            This privacy policy explains how we collect, use, and protect your information when you visit
            our website at downstream.studio.
          </p>
        </section>

        <section>
          <h2>Information We Collect</h2>

          <h3>Information You Provide</h3>
          <p>When you apply for our beta program, we collect:</p>
          <ul>
            <li><strong>Name</strong> - To address you personally</li>
            <li><strong>Email address</strong> - To communicate about your application</li>
            <li><strong>Story description</strong> - To understand your project</li>
            <li><strong>Usage intent</strong> - To understand how you plan to use the stream</li>
            <li><strong>Link to existing work</strong> (optional) - To learn more about you</li>
          </ul>

          <h3>Information Collected Automatically</h3>
          <p>
            We use <a href="https://umami.is" target="_blank" rel="noopener noreferrer">Umami</a>,
            a privacy-focused analytics service, to understand how visitors use our site. Umami collects:
          </p>
          <ul>
            <li>Pages visited</li>
            <li>Referrer (how you found us)</li>
            <li>Browser type and device category</li>
            <li>Country (derived from IP, but IP is not stored)</li>
            <li>Session duration</li>
          </ul>
          <p>
            <strong>Important:</strong> Umami does not use cookies, does not collect personal information,
            and does not track you across websites. Your IP address is never stored. All data is anonymized
            and aggregated.
          </p>
        </section>

        <section>
          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process and respond to your beta application</li>
            <li>Communicate with you about our services</li>
            <li>Understand how visitors use our website (anonymized analytics)</li>
            <li>Improve our website and services</li>
          </ul>
          <p>We do not sell your personal information. We do not use your data for advertising or retargeting.</p>
        </section>

        <section>
          <h2>Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Purpose</th>
                <th>Privacy Policy</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Vercel</td>
                <td>Website hosting</td>
                <td><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Link</a></td>
              </tr>
              <tr>
                <td>Umami Cloud</td>
                <td>Privacy-focused analytics</td>
                <td><a href="https://umami.is/privacy" target="_blank" rel="noopener noreferrer">Link</a></td>
              </tr>
              <tr>
                <td>Cal.com</td>
                <td>Meeting scheduling</td>
                <td><a href="https://cal.com/privacy" target="_blank" rel="noopener noreferrer">Link</a></td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>
            <strong>We do not use tracking cookies.</strong> Umami, our analytics provider, is specifically
            designed to work without cookies.
          </p>
          <p>
            Essential cookies may be used by our hosting provider (Vercel) for security and functionality
            purposes. These are strictly necessary for the website to function and cannot be disabled.
          </p>
        </section>

        <section>
          <h2>Data Retention</h2>
          <ul>
            <li><strong>Application data:</strong> Retained for 2 years after your last interaction with us, or until you request deletion</li>
            <li><strong>Analytics data:</strong> Aggregated and anonymized, retained indefinitely</li>
          </ul>
        </section>

        <section>
          <h2>Your Rights</h2>
          <p>Under GDPR and other privacy regulations, you have the right to:</p>
          <ul>
            <li><strong>Access</strong> - Request a copy of the personal data we hold about you</li>
            <li><strong>Rectification</strong> - Request correction of inaccurate data</li>
            <li><strong>Erasure</strong> - Request deletion of your personal data</li>
            <li><strong>Portability</strong> - Request your data in a portable format</li>
            <li><strong>Object</strong> - Object to processing of your personal data</li>
          </ul>
          <p>To exercise any of these rights, contact us at ferencz@pinelines.eu.</p>
        </section>

        <section>
          <h2>International Transfers</h2>
          <p>
            Your data may be processed in the United States (where our hosting and analytics providers operate).
            We ensure appropriate safeguards are in place for international data transfers.
          </p>
        </section>

        <section>
          <h2>Children's Privacy</h2>
          <p>
            Our service is not directed to children under 16. We do not knowingly collect personal
            information from children.
          </p>
        </section>

        <section>
          <h2>Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of significant
            changes by posting the new policy on this page with an updated date.
          </p>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>
            If you have questions about this privacy policy or our data practices, contact us at:
          </p>
          <p>
            <strong>Email:</strong> ferencz@pinelines.eu
          </p>
        </section>

        <div className={styles.backLink}>
          <a href="/">Back to Home</a>
        </div>
      </div>
    </div>
  )
}
