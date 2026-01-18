/**
 * Content components for NEON NIGHTS
 */

const styles = {
  eyebrow: {
    fontSize: 'clamp(0.7rem, 1vw, 0.85rem)',
    fontWeight: 600 as const,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    color: 'var(--ds-color-accent)',
    marginBottom: '0.75rem',
  },
  headline: {
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    fontWeight: 700 as const,
    lineHeight: 1.1,
    margin: '0 0 0.5rem 0',
    letterSpacing: '-0.02em',
  },
  subhead: {
    fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)',
    fontWeight: 400 as const,
    lineHeight: 1.4,
    color: 'var(--ds-color-muted)',
    marginBottom: '1.5rem',
  },
  body: {
    fontSize: 'clamp(0.95rem, 1.2vw, 1.1rem)',
    lineHeight: 1.8,
    marginBottom: '1.25rem',
    opacity: 0.9,
  },
  artistName: {
    fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
    fontWeight: 700 as const,
    lineHeight: 1.2,
    marginBottom: '0.5rem',
  },
  artistLabel: {
    fontSize: 'clamp(0.65rem, 0.9vw, 0.75rem)',
    fontWeight: 600 as const,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    color: 'var(--ds-color-accent)',
    marginBottom: '0.25rem',
  },
  artistBio: {
    fontSize: 'clamp(0.85rem, 1.1vw, 1rem)',
    lineHeight: 1.6,
    color: 'var(--ds-color-muted)',
    marginBottom: '2rem',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: '0.75rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  priceLabel: {
    fontSize: 'clamp(0.85rem, 1.1vw, 1rem)',
    fontWeight: 500 as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },
  priceValue: {
    fontSize: 'clamp(1.2rem, 1.8vw, 1.5rem)',
    fontWeight: 700 as const,
    color: 'var(--ds-color-accent)',
  },
  cta: {
    display: 'inline-block',
    marginTop: '2rem',
    padding: '1rem 2.5rem',
    background: 'var(--ds-color-accent)',
    color: '#000',
    fontSize: 'clamp(0.85rem, 1.1vw, 1rem)',
    fontWeight: 700 as const,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  venue: {
    marginTop: '2.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: 'clamp(0.8rem, 1vw, 0.9rem)',
    color: 'var(--ds-color-muted)',
    lineHeight: 1.6,
  },
}

export function OpenerContent() {
  return (
    <>
      <div style={styles.eyebrow}>Saturday, February 15</div>
      <h1 style={styles.headline}>NEON NIGHTS</h1>
      <p style={styles.subhead}>11PM — 6AM</p>
      <p style={styles.body}>
        One night. Three floors. Eight hours of relentless energy. This isn't just a party — it's a
        full sensory takeover.
      </p>
      <p style={styles.body}>
        State-of-the-art sound. A lighting rig that cost more than most venues. And a lineup that
        took us six months to lock down.
      </p>
    </>
  )
}

export function LineupContent() {
  return (
    <>
      <div style={styles.artistLabel}>Headliner</div>
      <h2 style={styles.artistName}>DJ AURORA</h2>
      <p style={styles.artistBio}>
        Fresh from her Berghain residency. 2M+ monthly listeners. The techno press calls her
        "the architect of the 4am moment."
      </p>

      <div style={styles.artistLabel}>Support</div>
      <h2 style={{...styles.artistName, fontSize: 'clamp(1.4rem, 2.2vw, 1.8rem)'}}>
        MARCO SILVA • LEXI WAVE
      </h2>
      <p style={styles.artistBio}>
        Budapest's finest warming up the decks. Deep house into peak-time techno. They know exactly
        how to build a room.
      </p>
    </>
  )
}

export function TicketsContent() {
  return (
    <>
      <div style={styles.eyebrow}>Tickets</div>
      <h2 style={{...styles.headline, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginBottom: '1.5rem'}}>
        Lock in your spot
      </h2>

      <div style={styles.priceRow}>
        <span style={styles.priceLabel}>Early Bird</span>
        <span style={styles.priceValue}>€25</span>
      </div>
      <div style={styles.priceRow}>
        <span style={styles.priceLabel}>General</span>
        <span style={styles.priceValue}>€35</span>
      </div>
      <div style={styles.priceRow}>
        <span style={styles.priceLabel}>Door</span>
        <span style={styles.priceValue}>€45</span>
      </div>
      <div style={{...styles.priceRow, borderBottom: 'none'}}>
        <span style={styles.priceLabel}>VIP Tables</span>
        <span style={styles.priceValue}>from €500</span>
      </div>

      <p style={{...styles.body, marginTop: '1.5rem', fontSize: 'clamp(0.85rem, 1vw, 0.95rem)'}}>
        Early bird sells out fast. Last event went in 48 hours.
      </p>

      <button style={styles.cta}>
        Get Tickets
      </button>

      <div style={styles.venue}>
        <strong>The Club</strong><br />
        123 Party Street, Budapest<br />
        21+ with valid ID
      </div>
    </>
  )
}
