'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './beta.module.css'

const FOUNDING_STORY_URL = 'https://stream-founding-story.vercel.app/'
const AZ_EHSEG_URL = 'https://downstream-stream-az-ehseg-v2.vercel.app/'
const FLIGHT_OF_RAVENS_URL = 'https://flight-of-ravens-v2.vercel.app/'
const BOOKING_URL = 'https://cal.com/ferencz-csuszner/30min'

export default function BetaLandingPage() {
  const [headerVisible, setHeaderVisible] = useState(false)
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const formRef = useRef<HTMLDivElement>(null)
  const streamRef = useRef<HTMLDivElement>(null)

  // Show header after scrolling past initial viewport
  useEffect(() => {
    const handleScroll = () => {
      setHeaderVisible(window.scrollY > window.innerHeight * 0.5)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToStream = () => {
    streamRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormState('submitting')

    const form = e.currentTarget
    const formData = new FormData(form)

    // Build story message with all form fields
    const storyParts = [
      formData.get('story'),
      `\n\nUsage: ${formData.get('usage')}`,
      formData.get('work') ? `\nWork: ${formData.get('work')}` : ''
    ].join('')

    try {
      const response = await fetch('https://stream-founding-story.vercel.app/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          story: storyParts
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setFormState('success')
        form.reset()
      } else {
        setFormState('error')
      }
    } catch {
      setFormState('error')
    }
  }

  return (
    <div className={styles.page}>
      {/* Floating Header - appears after scroll */}
      <header className={`${styles.header} ${headerVisible ? styles.headerVisible : ''}`}>
        <span className={styles.logo}>Downstream</span>
        <nav className={styles.nav}>
          <button onClick={scrollToStream} className={styles.navLink}>Story</button>
          <a href="#examples" className={styles.navLink}>Examples</a>
          <button onClick={scrollToForm} className={styles.navLink}>Apply</button>
        </nav>
      </header>

      {/* Hero - The Founding Story Stream */}
      <section className={styles.streamSection} ref={streamRef}>
        <div className={styles.streamContainer}>
          <iframe
            src={FOUNDING_STORY_URL}
            title="The Founding Story"
            className={styles.streamIframe}
            allow="autoplay"
          />
        </div>

        {/* Fade overlay at bottom with CTA */}
        <div className={styles.streamFade}>
          <button onClick={scrollToForm} className={styles.ctaPrimary}>
            Tell Us Your Story
          </button>
        </div>
      </section>

      {/* Transition text */}
      <section className={styles.transition}>
        <div className={styles.container}>
          <p className={styles.transitionText}>
            You just experienced a stream.<br />
            <span className={styles.muted}>Here's another one.</span>
          </p>
        </div>
      </section>

      {/* More Examples */}
      <section className={styles.examples} id="examples">
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>More Examples</h2>
          <p className={styles.sectionSubtitle}>
            Different stories. Different moods. Same medium.
          </p>
        </div>

        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleFrame}>
              <iframe
                src={AZ_EHSEG_URL}
                title="Az Éhség (The Hunger)"
                className={styles.exampleIframe}
                allow="autoplay"
              />
            </div>
            <div className={styles.exampleInfo}>
              <h3>Az Éhség</h3>
              <p className={styles.exampleMeta}>Hungarian Literary Fiction</p>
              <p className={styles.exampleDesc}>
                A cosmic tale of hunger, survival, and impossible choices.
                Dark, meditative, existential.
              </p>
              <a
                href={AZ_EHSEG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.exampleLink}
              >
                Open Full Screen
              </a>
            </div>
          </div>

          <div className={styles.exampleCard}>
            <div className={styles.exampleFrame}>
              <iframe
                src={FLIGHT_OF_RAVENS_URL}
                title="Flight of Ravens"
                className={styles.exampleIframe}
                allow="autoplay"
              />
            </div>
            <div className={styles.exampleInfo}>
              <h3>Flight of Ravens</h3>
              <p className={styles.exampleMeta}>Surrealist Fiction</p>
              <p className={styles.exampleDesc}>
                The end of the world arrives with the disappearance of ravens.
                Surreal, apocalyptic, dreamlike.
              </p>
              <a
                href={FLIGHT_OF_RAVENS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.exampleLink}
              >
                Open Full Screen
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className={styles.audience}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Who This Is For</h2>
          <div className={styles.audienceGrid}>
            <div className={styles.audienceCard}>
              <h3>Authors</h3>
              <p>Transform a book excerpt into an immersive preview that hooks readers before they buy.</p>
            </div>
            <div className={styles.audienceCard}>
              <h3>Founders</h3>
              <p>Tell your origin story in a way that actually gets read. Make your "About" page unforgettable.</p>
            </div>
            <div className={styles.audienceCard}>
              <h3>Coaches & Creators</h3>
              <p>Stand out in a crowded market. Let people experience your message, not just read it.</p>
            </div>
            <div className={styles.audienceCard}>
              <h3>Brands</h3>
              <p>Turn your mission statement into something people actually feel. Story-driven, not slogan-driven.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Application */}
      <section className={styles.apply} id="apply" ref={formRef}>
        <div className={styles.container}>
          <div className={styles.applyContent}>
            <div className={styles.applyText}>
              <h2>Join the Beta</h2>
              <p className={styles.applyDescription}>
                We're looking for 10 storytellers to test Downstream with real content.
              </p>
              <div className={styles.applyDeal}>
                <p><strong>Founder Price Starts at $99</strong></p>
                <p><strong>You bring:</strong> A story (1,000-2,000 words)</p>
                <p><strong>We deliver:</strong> A complete stream</p>
                <p><strong>In exchange for:</strong> Honest feedback</p>
              </div>
              <p className={styles.applyNote}>
                Not ready to apply? <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">Book a call</a> to learn more.
              </p>
            </div>

            <div className={styles.applyForm}>
              {formState === 'success' ? (
                <div className={styles.successMessage}>
                  <h3>Application received.</h3>
                  <p>We'll review your story and reach out within 48 hours if it's a fit.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Your name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="story">What story do you want to bring to life?</label>
                    <textarea
                      id="story"
                      name="story"
                      rows={4}
                      placeholder="A book excerpt, your origin story, a brand narrative, a personal essay..."
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="usage">Where will this live?</label>
                    <select id="usage" name="usage" required>
                      <option value="">Select one...</option>
                      <option value="website">Website / Landing Page</option>
                      <option value="newsletter">Newsletter</option>
                      <option value="book-launch">Book Launch</option>
                      <option value="product-launch">Product Launch</option>
                      <option value="personal">Personal Project</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="work">Link to your existing work</label>
                    <input
                      type="url"
                      id="work"
                      name="work"
                      placeholder="https://..."
                    />
                    <span className={styles.formHint}>Website, newsletter, LinkedIn - anything that shows us who you are</span>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email">Your email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={formState === 'submitting'}
                  >
                    {formState === 'submitting' ? 'Sending...' : 'Apply for Beta'}
                  </button>

                  {formState === 'error' && (
                    <p className={styles.errorMessage}>
                      Something went wrong. Please try again or email us directly.
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <span className={styles.logo}>Downstream</span>
          <p>Scroll-driven visual storytelling</p>
          <p className={styles.copyright}>© 2026 Downstream Studio</p>
        </div>
      </footer>
    </div>
  )
}
