/**
 * Content components for LIMANI
 */

const styles = {
  eyebrow: {
    fontSize: 'clamp(0.7rem, 1vw, 0.8rem)',
    fontWeight: 500 as const,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    color: 'var(--ds-color-accent)',
    marginBottom: '1rem',
  },
  headline: {
    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
    fontWeight: 400 as const,
    lineHeight: 1.15,
    margin: '0 0 0.75rem 0',
    letterSpacing: '-0.01em',
    fontFamily: 'var(--ds-font-heading)',
  },
  tagline: {
    fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
    fontWeight: 400 as const,
    fontStyle: 'italic' as const,
    lineHeight: 1.5,
    color: 'var(--ds-color-muted)',
    marginBottom: '2rem',
  },
  body: {
    fontSize: 'clamp(0.95rem, 1.2vw, 1.05rem)',
    lineHeight: 1.85,
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: 'clamp(1.3rem, 2vw, 1.6rem)',
    fontWeight: 400 as const,
    lineHeight: 1.3,
    marginBottom: '1.25rem',
    marginTop: '0',
    fontFamily: 'var(--ds-font-heading)',
  },
  menuCategory: {
    fontSize: 'clamp(0.7rem, 0.9vw, 0.8rem)',
    fontWeight: 600 as const,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    color: 'var(--ds-color-accent)',
    marginBottom: '0.5rem',
    marginTop: '1.75rem',
  },
  menuItem: {
    fontSize: 'clamp(1rem, 1.3vw, 1.15rem)',
    fontWeight: 500 as const,
    marginBottom: '0.25rem',
  },
  menuDesc: {
    fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)',
    lineHeight: 1.6,
    color: 'var(--ds-color-muted)',
    marginBottom: '0',
  },
  cta: {
    display: 'inline-block',
    marginTop: '2rem',
    padding: '1rem 2.5rem',
    background: 'var(--ds-color-accent)',
    color: '#fff',
    fontSize: 'clamp(0.8rem, 1vw, 0.9rem)',
    fontWeight: 600 as const,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  infoBlock: {
    marginTop: '2.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid var(--ds-color-accent)',
  },
  infoLabel: {
    fontSize: 'clamp(0.65rem, 0.85vw, 0.75rem)',
    fontWeight: 600 as const,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    color: 'var(--ds-color-accent)',
    marginBottom: '0.35rem',
  },
  infoText: {
    fontSize: 'clamp(0.9rem, 1.1vw, 1rem)',
    lineHeight: 1.5,
    marginBottom: '1.25rem',
  },
}

export function WelcomeContent() {
  return (
    <>
      <div style={styles.eyebrow}>Est. 2019 · Barcelona</div>
      <h1 style={styles.headline}>LIMANI</h1>
      <p style={styles.tagline}>Where the sea meets the table.</p>
      <p style={styles.body}>
        Every morning, our fishermen return with the night's catch. By noon, it's on your plate —
        grilled whole over olive wood, dressed with nothing but lemon and the best oil from Kalamata.
      </p>
      <p style={styles.body}>
        This is cooking the way it was meant to be. Simple. Honest. Mediterranean.
      </p>
    </>
  )
}

export function TheTableContent() {
  return (
    <>
      <h2 style={styles.sectionTitle}>The Menu</h2>
      <p style={styles.body}>
        We don't do complicated. Three generations of family recipes, prepared with ingredients that
        arrived this morning. When the fish is this fresh, less is more.
      </p>

      <div style={styles.menuCategory}>To Share</div>
      <p style={styles.menuItem}>Mezze Selection</p>
      <p style={styles.menuDesc}>House-made hummus, smoky baba ganoush, tzatziki, warm pita</p>

      <div style={styles.menuCategory}>From the Grill</div>
      <p style={styles.menuItem}>Whole Branzino</p>
      <p style={styles.menuDesc}>Caught this morning, grilled over olive wood, lemon, wild herbs</p>

      <div style={styles.menuCategory}>From the Garden</div>
      <p style={styles.menuItem}>Heirloom Tomato Salad</p>
      <p style={styles.menuDesc}>Aged feta, Kalamata olives, oregano, single-estate olive oil</p>
    </>
  )
}

export function JoinUsContent() {
  return (
    <>
      <div style={styles.eyebrow}>Join Us</div>
      <h2 style={{...styles.sectionTitle, fontSize: 'clamp(1.6rem, 2.5vw, 2rem)'}}>
        Your table is waiting
      </h2>
      <p style={styles.body}>
        Whether it's a long Sunday lunch with family or an intimate dinner by candlelight — every
        meal here feels like coming home.
      </p>

      <button style={styles.cta}>
        Reserve a Table
      </button>

      <div style={styles.infoBlock}>
        <div style={styles.infoLabel}>Hours</div>
        <p style={styles.infoText}>
          Lunch & Dinner<br />
          Tuesday – Sunday, 12pm – 11pm
        </p>

        <div style={styles.infoLabel}>Location</div>
        <p style={styles.infoText}>
          14 Seaside Promenade<br />
          Barcelona, Spain
        </p>

        <div style={styles.infoLabel}>Contact</div>
        <p style={{...styles.infoText, marginBottom: 0}}>
          +34 932 000 000<br />
          reservations@limani.es
        </p>
      </div>
    </>
  )
}
