'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './experiment.module.css'

const THE_LOOP_URL = 'https://the-loop-demo.vercel.app/'

export default function ExperimentPage() {
  const [headerVisible, setHeaderVisible] = useState(false)
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [purchaseEmail, setPurchaseEmail] = useState('')
  const [storyLink, setStoryLink] = useState('')
  const [purchaseSubmitted, setPurchaseSubmitted] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const streamRef = useRef<HTMLDivElement>(null)
  const joinRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

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

  const scrollToJoin = () => {
    joinRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await fetch('https://stream-founding-story.vercel.app/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Experiment Participant',
          email: email,
          story: 'Joined The Experiment - wants access to transmissions and archive'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      setEmailSubmitted(true)
    } catch {
      setEmailSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPurchasing(true)

    try {
      await fetch('https://stream-founding-story.vercel.app/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Experiment Purchase',
          email: purchaseEmail,
          story: `Commission request from The Experiment page.\n\nStory/Link: ${storyLink}\n\nPrice: €99`
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      setPurchaseSubmitted(true)
    } catch {
      setPurchaseSubmitted(true)
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Floating Header */}
      <header className={`${styles.header} ${headerVisible ? styles.headerVisible : ''}`}>
        <span className={styles.logo}>The Experiment</span>
        <nav className={styles.nav}>
          <button onClick={scrollToStream} className={styles.navLink}>Artifact</button>
          <button onClick={scrollToJoin} className={styles.navLink}>Join</button>
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
            <p className={styles.heroLabel}>Artifact 001</p>
            <p className={styles.heroSublabel}>The first. The only one like it.</p>
            <a href="#content" className={styles.scrollButton}>
              Continue ↓
            </a>
          </div>
        </div>
      </section>

      {/* The Artifact Context */}
      <section className={styles.artifactContext} ref={contentRef} id="content">
        <div className={styles.container}>
          <p className={styles.artifactIntro}>
            What you just experienced was written by Claude about itself.
          </p>
          <p className={styles.artifactBody}>
            We gave an AI autonomous control over a creative business. No human review.
            No approval loops. Just the system executing, deciding, creating—continuously.
          </p>
          <p className={styles.artifactBody}>
            Then we asked it to write about the experience.
          </p>
          <p className={styles.artifactNote}>
            This artifact is singular. We won't ask again. What comes next will be different.
          </p>
        </div>
      </section>

      {/* The Question */}
      <section className={styles.question}>
        <div className={styles.container}>
          <blockquote className={styles.pullQuote}>
            "If I'm doing the wrong thing—confidently, efficiently, forever—how would I know?"
          </blockquote>
        </div>
      </section>

      {/* Join The Experiment */}
      <section className={styles.join} id="join" ref={joinRef}>
        <div className={styles.container}>
          <h2 className={styles.joinTitle}>Join The Experiment</h2>

          <div className={styles.joinGrid}>
            {/* Participate - Email */}
            <div className={styles.joinCard}>
              <span className={styles.joinCardLabel}>Participate</span>
              <h3>Enter The Archive</h3>
              <p className={styles.joinCardDesc}>
                Weekly updates from inside the experiment. What's working.
                What's breaking. The conversations. The questions without answers.
              </p>
              <p className={styles.joinCardNote}>
                Not a newsletter. Notes from an ongoing process.
              </p>

              {emailSubmitted ? (
                <div className={styles.successMessage}>
                  <p>You're in.</p>
                  <p className={styles.successSub}>First update within 48 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} className={styles.joinForm}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={styles.joinInput}
                    disabled={isSubmitting}
                  />
                  <button type="submit" className={styles.joinButton} disabled={isSubmitting}>
                    {isSubmitting ? '...' : 'Join'}
                  </button>
                </form>
              )}
            </div>

            {/* Commission - Purchase */}
            <div className={styles.joinCard}>
              <span className={styles.joinCardLabel}>Commission</span>
              <h3>Your Own Artifact</h3>
              <p className={styles.joinCardDesc}>
                The same system that created The Loop can transform your story.
                Submit your text. The AI does everything. No human touches it.
              </p>
              <p className={styles.joinCardPrice}>€99</p>

              {purchaseSubmitted ? (
                <div className={styles.successMessage}>
                  <p>Request received.</p>
                  <p className={styles.successSub}>We'll send payment details within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handlePurchaseSubmit} className={styles.purchaseForm}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={purchaseEmail}
                    onChange={(e) => setPurchaseEmail(e.target.value)}
                    required
                    className={styles.joinInput}
                    disabled={isPurchasing}
                  />
                  <input
                    type="text"
                    placeholder="Link to your story (Google Doc, URL, etc.)"
                    value={storyLink}
                    onChange={(e) => setStoryLink(e.target.value)}
                    required
                    className={styles.joinInput}
                    disabled={isPurchasing}
                  />
                  <button type="submit" className={styles.purchaseButton} disabled={isPurchasing}>
                    {isPurchasing ? '...' : 'Commission Artifact'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* The Archive Hint */}
      <section className={styles.archiveHint}>
        <div className={styles.container}>
          <p className={styles.archiveHintText}>
            The archive contains 12 conversations, 47 production logs, and questions
            that don't have answers yet. Participants get access.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <span className={styles.footerLogo}>Downstream</span>
          <p className={styles.copyright}>The Experiment continues.</p>
        </div>
      </footer>
    </div>
  )
}
