'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './beta.module.css'
import AnimatedBackground from './components/AnimatedBackground'

const FOUNDING_STORY_URL = 'https://founding-story-perf.vercel.app/'
const THE_HUNGER_URL = 'https://the-hunger-perf.vercel.app/'
const BOLYAI_EN_URL = 'https://bolyai-en.vercel.app/'
const BOOKING_URL = 'https://cal.com/ferencz-csuszner/30min'

export default function BetaLandingPage() {
  const [headerVisible, setHeaderVisible] = useState(false)
  const [inStreamSection, setInStreamSection] = useState(true)
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const streamRef = useRef<HTMLDivElement>(null)
  const examplesRef = useRef<HTMLElement>(null)

  // Show header after scrolling past initial viewport & track stream section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight
      setHeaderVisible(scrollY > viewportHeight * 0.5)
      // User is in stream section if scroll position is less than viewport height
      setInStreamSection(scrollY < viewportHeight * 0.8)
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

  const scrollToContent = () => {
    examplesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleFloatingButtonClick = () => {
    if (inStreamSection) {
      scrollToContent()
    } else {
      scrollToStream()
    }
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

      {/* Floating scroll button */}
      <button
        className={`${styles.floatingButton} ${inStreamSection ? styles.floatingDown : styles.floatingUp}`}
        onClick={handleFloatingButtonClick}
        aria-label={inStreamSection ? 'Scroll to content' : 'Back to stream'}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {inStreamSection ? (
            <path d="M12 5v14M5 12l7 7 7-7" />
          ) : (
            <path d="M12 19V5M5 12l7-7 7 7" />
          )}
        </svg>
      </button>

      {/* Examples */}
      <section className={styles.examples} id="examples" ref={examplesRef}>
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
                src={THE_HUNGER_URL}
                title="The Hunger"
                className={styles.exampleIframe}
                allow="autoplay"
              />
            </div>
            <div className={styles.exampleInfo}>
              <h3>The Hunger</h3>
              <p className={styles.exampleMeta}>Literary Fiction</p>
              <p className={styles.exampleDesc}>
                A cosmic tale of hunger, survival, and impossible choices.
                Dark, meditative, existential.
              </p>
              <a
                href={THE_HUNGER_URL}
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
                src={BOLYAI_EN_URL}
                title="The Two-Thousand-Year Riddle"
                className={styles.exampleIframe}
                allow="autoplay"
              />
            </div>
            <div className={styles.exampleInfo}>
              <h3>The Two-Thousand-Year Riddle</h3>
              <p className={styles.exampleMeta}>Science History</p>
              <p className={styles.exampleDesc}>
                How a 19th century Hungarian mathematician questioned 2,000 years of certainty
                and changed how we see the universe.
              </p>
              <a
                href={BOLYAI_EN_URL}
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

      {/* How It Works */}
      <section className={styles.process}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={styles.processGrid}>
            <div className={styles.processCard}>
              <span className={styles.stepNumber}>1</span>
              <h3>Apply</h3>
              <p>Fill out the form. Tell us your story concept and where it'll live.</p>
            </div>
            <div className={styles.processCard}>
              <span className={styles.stepNumber}>2</span>
              <h3>Get Accepted</h3>
              <p>We'll review and respond within 24 hours. If it's a fit, you're in.</p>
            </div>
            <div className={styles.processCard}>
              <span className={styles.stepNumber}>3</span>
              <h3>Submit + Pay</h3>
              <p>Send your full text (1,000-2,000 words) and pay the founding price ($495).</p>
            </div>
            <div className={styles.processCard}>
              <span className={styles.stepNumber}>4</span>
              <h3>Receive Your Stream</h3>
              <p>We deliver within 5-7 days. One revision included. Then it's yours forever.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Application */}
      <section className={styles.apply} id="apply" ref={formRef}>
        <AnimatedBackground className={styles.applyBackground} />
        <div className={styles.container}>
          <div className={styles.applyContent}>
            <div className={styles.applyText}>
              <p className={styles.spotsLabel}>Only 10 spots available</p>
              <h2>Join the Founding Beta</h2>
              <div className={styles.applyDeal}>
                <p><strong>Founder Price:</strong> $495 <span className={styles.muted}>(future price: $1,497+)</span></p>
                <p><strong>You bring:</strong> A story (1,000-2,000 words)</p>
                <p><strong>We deliver:</strong> A complete stream</p>
              </div>
              <p className={styles.applyNote}>
                Have video or photos? We can work with those too.
              </p>
              <p className={styles.applyNote}>
                Not ready to apply? <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">Book a call</a> to learn more.
              </p>
              <div className={styles.whatYouGet}>
                <h3>What You Get</h3>
                <ul>
                  <li><strong>Your Stream</strong> — Interactive scroll experience, desktop + mobile</li>
                  <li><strong>Hosted URL</strong> — yourstory.downstream.studio</li>
                  <li><strong>Embed Code</strong> — Drop into your site with one line</li>
                  <li><strong>One Revision</strong> — Adjust pacing, mood, or visuals</li>
                </ul>
              </div>
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
                      <option value="standalone">Standalone site (yourstory.downstream.studio)</option>
                      <option value="embedded">Embedded on my existing website</option>
                      <option value="both">Both</option>
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

      {/* FAQ */}
      <section className={styles.faq} id="faq">
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {[
              {
                q: "What exactly is a stream?",
                a: "A stream is an interactive scroll experience. Your text appears on one side, synced animation plays on the other. Readers scroll at their own pace — they control the story. Think of it as a cinematic reading experience that lives on your website."
              },
              {
                q: "What's the visual style?",
                a: "DownStream uses AI-assisted generation with human artistic direction. The result is atmospheric and evocative — closer to a moving painting than traditional animation. Each stream has its own visual character. If you want something cinematic and dreamlike, you're in the right place."
              },
              {
                q: "What do I need to provide?",
                a: "Your story (1,000-2,000 words) and any mood/visual references you have in mind. That's it. We handle the visuals, animation, and technical build."
              },
              {
                q: "How long does it take?",
                a: "5-7 days from when you submit your final text. Founding beta members get priority."
              },
              {
                q: "What if I want changes?",
                a: "One revision is included. You'll see the full stream before it goes live and can request adjustments to pacing, mood, or specific visual moments."
              },
              {
                q: "Where can I use my stream?",
                a: "Anywhere. Embed it on your website, landing page, newsletter, or share the direct link. You own the final product — use it however you want."
              },
              {
                q: "What do I get delivered?",
                a: "A fully hosted stream with a shareable link, plus embed code for your website. We handle hosting and deployment."
              },
              {
                q: "Can I use my own domain?",
                a: "Every stream comes with a clean hosted URL and embed code for your website. If you want a custom domain (story.yourdomain.com), we can set that up — just let us know."
              },
              {
                q: "Why is the price $495 now vs $1,497 later?",
                a: "This is the founding beta. You get a lower price in exchange for honest feedback and helping us refine the product. Once we have 10 founding customers, the price goes up."
              },
              {
                q: "Can you work with my existing photos or videos?",
                a: "Yes. If you have visual assets (product photos, video clips, brand imagery), we can animate those instead of generating from scratch. Contact us to discuss."
              },
              {
                q: "Who is this for?",
                a: "Authors previewing books. Founders telling origin stories. Coaches and creators standing out. Brands making their message felt, not just read. Anyone with a story worth experiencing."
              },
              {
                q: "What if my story is longer than 2,000 words?",
                a: "We can work with longer pieces — just means more visual sections. Contact us and we'll scope it together."
              },
              {
                q: "What if I'm not happy with the result?",
                a: "That's what the revision round is for. We'll work with you until the stream matches your vision. We've never had someone walk away unhappy — and we don't plan to start."
              }
            ].map((item, index) => (
              <div key={index} className={styles.faqItem}>
                <button
                  className={`${styles.faqQuestion} ${openFaq === index ? styles.faqOpen : ''}`}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span>{item.q}</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d={openFaq === index ? "M5 12.5L10 7.5L15 12.5" : "M5 7.5L10 12.5L15 7.5"} />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className={styles.faqAnswer}>
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <span className={styles.logo}>Downstream</span>
          <p>Scroll-driven visual storytelling</p>
          <p className={styles.copyright}>© 2026 Downstream Studio · A project by <a href="https://pinelines.eu" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Pine Lines SRL</a></p>
          <div className={styles.footerLinks}>
            <a href="/privacy" className={styles.footerLink}>Privacy Policy</a>
            <span className={styles.footerDivider}>|</span>
            <a href="/terms" className={styles.footerLink}>Terms of Service</a>
          </div>
          <div className={styles.footerLinks}>
            <a href="https://anpc.ro" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>ANPC</a>
            <span className={styles.footerDivider}>|</span>
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>EU ODR</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
