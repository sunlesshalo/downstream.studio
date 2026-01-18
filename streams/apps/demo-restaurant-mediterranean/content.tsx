/**
 * Content components for LIMANI
 * AUTO-GENERATED from production.json - DO NOT EDIT MANUALLY
 */

function Dialogue({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontStyle: 'italic',
      marginLeft: '0.5rem',
      borderLeft: '2px solid var(--ds-color-muted)',
      paddingLeft: '1rem',
      margin: '1.5rem 0 1.5rem 0.5rem'
    }}>
      {children}
    </div>
  )
}

export function WelcomeContent() {
  return (
    <>
      <h2>LIMANI</h2>
      <p>Fresh. Simple. Mediterranean.</p>
      <p>Where the sea meets the table.</p>
    </>
  )
}

export function TheTableContent() {
  return (
    <>
      <h2>THE TABLE</h2>
      <p>Mezze to Share
Hummus, baba ganoush, tzatziki, warm pita</p>
      <p>From the Grill
Whole branzino, lemon, olive oil, wild herbs</p>
      <p>The Garden
Heirloom tomatoes, cucumber, feta, Kalamata olives</p>
    </>
  )
}

export function JoinUsContent() {
  return (
    <>
      <h2>JOIN US</h2>
      <h2>Lunch &amp; Dinner
Tuesday – Sunday</h2>
      <h2>14 Seaside Promenade
Barcelona</h2>
      <h2>RESERVE YOUR TABLE</h2>
    </>
  )
}
