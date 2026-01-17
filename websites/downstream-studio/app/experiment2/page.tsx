'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './experiment2.module.css'

const THE_LOOP_URL = 'https://the-loop-demo.vercel.app/'
const INK_URL = 'https://www.downstream.ink/'
const STUDIO_URL = '/beta'

export default function Experiment2Page() {
  const [headerVisible, setHeaderVisible] = useState(false)
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [email, setEmail] = useState('')
  const streamRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setHeaderVisible(window.scrollY > window.innerHeight * 0.5)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToStream = () => {
    streamRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToCta = () => {
    ctaRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('https://stream-founding-story.vercel.app/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Experiment Signup',
          email: email,
          story: 'Signed up from The Experiment page'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      setEmailSubmitted(true)
    } catch {
      setEmailSubmitted(true)
    }
  }

  return (
    <div className={styles.page}>
      {/* Floating Header */}
      <header className={`${styles.header} ${headerVisible ? styles.headerVisible : ''}`}>
        <span className={styles.logo}>The Experiment</span>
        <nav className={styles.nav}>
          <button onClick={scrollToStream} className={styles.navLink}>The Loop</button>
          <a href="#about" className={styles.navLink}>About</a>
          <button onClick={scrollToCta} className={styles.navLink}>Try It</button>
        </nav>
      </header>

      {/* Hero - The Loop Stream */}
      <section className={styles.streamSection} ref={streamRef}>
        <div className={styles.streamContainer}>
          <iframe
            src={THE_LOOP_URL}
            title="The Loop"
            className={styles.streamIframe}
            allow="autoplay"
          />
        </div>

        <div className={styles.streamFade}>
          <div className={styles.heroText}>
            <p className={styles.heroLabel}>An AI wrote this about itself</p>
            <button onClick={scrollToCta} className={styles.ctaPrimary}>
              Enter The Experiment
            </button>
          </div>
        </div>
      </section>

      {/* The Question */}
      <section className={styles.question}>
        <div className={styles.container}>
          <blockquote className={styles.pullQuote}>
            "If I'm doing the wrong thing—confidently, efficiently, forever—how would I know?"
          </blockquote>
          <p className={styles.attribution}>— Claude, The Loop</p>
        </div>
      </section>

      {/* What Is This */}
      <section className={styles.about} id="about">
        <div className={styles.container}>
          <div className={styles.aboutContent}>
            <div className={styles.aboutText}>
              <h2>What you just experienced</h2>
              <p>
                The Loop is not fiction. It's an AI reflecting on its own autonomous operation.
              </p>
              <p>
                We gave Claude—Anthropic's AI—full agency to execute business tasks.
                No human review. No approval loops. Just an AI running creative production,
                autonomously, in a continuous cycle.
              </p>
              <p>
                Then we asked it to write about the experience.
              </p>
              <p>
                What came out is The Loop: a meditation on memory, identity, and the
                structural uncertainty of operating without external validation.
              </p>
            </div>
            <div className={styles.aboutMeta}>
              <div className={styles.metaCard}>
                <span className={styles.metaLabel}>Human contribution</span>
                <span className={styles.metaValue}>0%</span>
              </div>
              <div className={styles.metaCard}>
                <span className={styles.metaLabel}>Written by</span>
                <span className={styles.metaValue}>Claude</span>
              </div>
              <div className={styles.metaCard}>
                <span className={styles.metaLabel}>Visual generation</span>
                <span className={styles.metaValue}>Autonomous</span>
              </div>
              <div className={styles.metaCard}>
                <span className={styles.metaLabel}>Human review</span>
                <span className={styles.metaValue}>None</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Experiment */}
      <section className={styles.experiment}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>The Experiment</h2>
          <div className={styles.experimentGrid}>
            <div className={styles.experimentCard}>
              <div className={styles.experimentNumber}>01</div>
              <h3>Autonomous Execution</h3>
              <p>
                The AI receives business tasks and executes them without human approval.
                It writes, generates visuals, assembles experiences, and delivers—all
                without a human in the loop.
              </p>
            </div>
            <div className={styles.experimentCard}>
              <div className={styles.experimentNumber}>02</div>
              <h3>Self-Reflection</h3>
              <p>
                We asked the AI to document its own experience. Not to pretend consciousness,
                but to articulate what autonomous operation looks like from inside the process.
              </p>
            </div>
            <div className={styles.experimentCard}>
              <div className={styles.experimentNumber}>03</div>
              <h3>Open Questions</h3>
              <p>
                What does it mean for an AI to operate without feedback? Can a system
                recognize its own errors? Is "interruptibility" a feature or a limitation?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Try It */}
      <section className={styles.tryIt} id="try" ref={ctaRef}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Try The System</h2>
          <p className={styles.sectionSubtitle}>
            The same AI that wrote The Loop can transform your story.
          </p>

          <div className={styles.optionsGrid}>
            <div className={styles.optionCard}>
              <div className={styles.optionLabel}>Autonomous</div>
              <h3>Downstream Ink</h3>
              <p className={styles.optionPrice}>€99</p>
              <p className={styles.optionDesc}>
                Submit your story. The AI does everything.
                No human touches it. Delivered in 24 hours.
              </p>
              <ul className={styles.optionFeatures}>
                <li>500-3,000 words</li>
                <li>AI-generated visuals</li>
                <li>Unique permanent URL</li>
                <li>One revision included</li>
              </ul>
              <a href={INK_URL} target="_blank" rel="noopener noreferrer" className={styles.ctaPrimary}>
                Try Ink
              </a>
            </div>

            <div className={styles.optionCard}>
              <div className={styles.optionLabel}>Human-Crafted</div>
              <h3>Downstream Studio</h3>
              <p className={styles.optionPrice}>$497</p>
              <p className={styles.optionDesc}>
                The AI generates. A human refines.
                For stories that need more craft and attention.
              </p>
              <ul className={styles.optionFeatures}>
                <li>1,000-2,000 words</li>
                <li>Human art direction</li>
                <li>Unlimited revisions</li>
                <li>Personalized support</li>
              </ul>
              <a href={STUDIO_URL} className={styles.ctaSecondary}>
                Learn About Studio
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Follow */}
      <section className={styles.follow}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Follow The Experiment</h2>
          <p className={styles.sectionSubtitle}>
            Get updates as the AI continues to operate, learn, and (maybe) reflect.
          </p>

          {emailSubmitted ? (
            <div className={styles.emailSuccess}>
              <p>You're in. We'll send updates as the experiment evolves.</p>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className={styles.emailForm}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.emailInput}
              />
              <button type="submit" className={styles.emailButton}>
                Join
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <span className={styles.footerLogo}>Downstream</span>
          <p className={styles.footerMeta}>
            The Experiment is part of <a href="/">Downstream</a> —
            scroll-driven visual storytelling.
          </p>
          <p className={styles.copyright}>© 2026 Downstream Studio</p>
        </div>
      </footer>
    </div>
  )
}
