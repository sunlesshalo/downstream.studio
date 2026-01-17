'use client'

import { useState, useEffect, useRef } from 'react'

const BOOKING_URL = 'https://cal.com/ferencz-csuszner/30min'
const DEMO_URL = 'https://downstream-stream-az-ehseg-v2.vercel.app/'

export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false)
  const demoRef = useRef<HTMLDivElement>(null)

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const openFullDemo = () => {
    setShowDemo(true)
  }

  const closeDemo = () => {
    setShowDemo(false)
  }

  // Close demo on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDemo()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  return (
    <div className="landing">
      {/* ============ HERO SECTION ============ */}
      <section className="hero">
        <video
          className="hero-video"
          src="/hero-loop.mp4"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        />
        <div className="hero-overlay" aria-hidden="true" />

        <header className="header">
          <span className="logo">Downstream</span>
          <nav className="nav">
            <button onClick={scrollToDemo} className="nav-link">Demo</button>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#pricing" className="nav-link">Pricing</a>
          </nav>
        </header>

        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-tagline">Scroll-Driven Visual Storytelling</p>
            <h1>Turn your text into cinematic experiences</h1>
            <p className="hero-description">
              We transform your writing into immersive, scroll-synchronized animations.
              Your audience doesn't just read — they experience your story.
            </p>
            <div className="hero-ctas">
              <button onClick={scrollToDemo} className="cta cta-primary">
                See It In Action
              </button>
              <a href="#contact" className="cta cta-secondary">
                Get a Quote
              </a>
            </div>
          </div>

          {/* Demo Preview */}
          <div className="demo-preview" onClick={openFullDemo}>
            <div className="demo-preview-inner">
              <video
                src="/demo-preview.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="demo-preview-video"
              />
              <div className="demo-preview-overlay">
                <span className="play-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </span>
                <span>Watch Full Demo</span>
              </div>
            </div>
          </div>
        </div>

        <button onClick={scrollToDemo} className="scroll-hint">
          <span>Scroll to explore</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
      </section>

      {/* ============ EARLY ACCESS BANNER ============ */}
      <section className="early-access-banner">
        <div className="container">
          <div className="banner-content">
            <span className="badge">Early Access</span>
            <p>We're launching soon and looking for <strong>10 founding creators</strong> to shape the future of visual storytelling.</p>
            <a href="#contact" className="banner-link">Get early access →</a>
          </div>
        </div>
      </section>

      {/* ============ DEMO SECTION ============ */}
      <section className="demo-section" ref={demoRef} id="demo">
        <div className="container">
          <h2>Experience the difference</h2>
          <p className="section-subtitle">
            This Hungarian short story "Az Éhség" (The Hunger) showcases our scroll-driven animation technology.
            Scroll through and watch the visuals sync perfectly with the narrative.
          </p>
        </div>

        <div className="demo-container">
          <div className="demo-frame">
            <iframe
              src={DEMO_URL}
              title="Az Éhség — Demo"
              className="demo-iframe"
              allow="autoplay"
            />
          </div>
          <div className="demo-cta-bar">
            <span>Like what you see?</span>
            <a href="#contact" className="cta cta-primary">Create Your Story</a>
          </div>
        </div>
      </section>

      {/* ============ USE CASES ============ */}
      <section className="use-cases" id="use-cases">
        <div className="container">
          <h2>Perfect for</h2>
          <div className="use-cases-grid">
            <div className="use-case">
              <div className="use-case-icon">📚</div>
              <h3>Authors & Publishers</h3>
              <p>Launch your book with an immersive preview that hooks readers from the first scroll.</p>
            </div>
            <div className="use-case">
              <div className="use-case-icon">🎯</div>
              <h3>Brand Storytelling</h3>
              <p>Tell your origin story or showcase your mission in a way that truly resonates.</p>
            </div>
            <div className="use-case">
              <div className="use-case-icon">📰</div>
              <h3>Premium Content</h3>
              <p>Transform long-form journalism or essays into engaging visual experiences.</p>
            </div>
            <div className="use-case">
              <div className="use-case-icon">🚀</div>
              <h3>Product Launches</h3>
              <p>Create memorable launch pages that tell the story behind your product.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <h2>How it works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Send your text</h3>
              <p>Share your story, article, or content. We'll review it and discuss your vision.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>We create the magic</h3>
              <p>Our team crafts custom animations that sync perfectly with your narrative flow.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Launch your story</h3>
              <p>Get a ready-to-deploy website or embed code. Your story goes live.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHY EARLY ACCESS ============ */}
      <section className="why-early">
        <div className="container">
          <h2>Why join early?</h2>
          <div className="benefits-grid">
            <div className="benefit">
              <span className="benefit-icon">🎁</span>
              <h3>50% off launch pricing</h3>
              <p>Lock in founder pricing before we go public.</p>
            </div>
            <div className="benefit">
              <span className="benefit-icon">🎯</span>
              <h3>Direct input</h3>
              <p>Help shape the product. Your feedback drives what we build.</p>
            </div>
            <div className="benefit">
              <span className="benefit-icon">⚡</span>
              <h3>Priority queue</h3>
              <p>Skip the waitlist when we launch publicly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section className="pricing" id="pricing">
        <div className="container">
          <h2>Early access pricing</h2>
          <p className="section-subtitle">
            Founding creators get 50% off. Limited to 10 spots.
          </p>
          <div className="pricing-single">
            <div className="pricing-card featured">
              <div className="pricing-badge">Founder Price</div>
              <div className="price-comparison">
                <span className="price-old">$2,000</span>
                <span className="price-arrow">→</span>
                <span className="price">$1,000</span>
              </div>
              <p className="pricing-description">For your first scroll-driven story</p>
              <ul className="pricing-features">
                <li>Up to 2,000 words</li>
                <li>5-10 animated segments</li>
                <li>Custom AI-generated visuals</li>
                <li>Scroll-synchronized animations</li>
                <li>Mobile-optimized</li>
                <li>Hosted on your domain</li>
                <li>Direct feedback channel with us</li>
              </ul>
              <a href="#contact" className="cta cta-primary pricing-cta">Claim Your Spot</a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTACT / CTA ============ */}
      <section className="contact" id="contact">
        <div className="container">
          <h2>Join the founding 10</h2>
          <p className="section-subtitle">
            Tell us about your story. If it's a good fit, we'll reach out within 24 hours.
          </p>
          <div className="contact-centered">
            <form className="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
              <input type="email" name="email" placeholder="Your email" required />
              <textarea name="message" placeholder="What's the story you want to bring to life? (A book excerpt, brand story, article...)" rows={4} required />
              <button type="submit" className="cta cta-primary">Apply for Early Access</button>
            </form>
            <p className="contact-note">
              Not ready yet? <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">Book a quick call</a> to learn more.
            </p>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <div className="container">
          <span className="logo">Downstream</span>
          <p>Scroll-driven visual storytelling</p>
          <p className="footer-copy">© 2025 Downstream Studio</p>
        </div>
      </footer>

      {/* ============ FULLSCREEN DEMO MODAL ============ */}
      {showDemo && (
        <div className="demo-modal" onClick={closeDemo}>
          <button className="demo-modal-close" onClick={closeDemo}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <iframe
            src={DEMO_URL}
            title="Az Éhség — Full Demo"
            className="demo-modal-iframe"
            allow="autoplay"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
