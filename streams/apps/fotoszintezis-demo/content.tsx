/**
 * Content components for Jöjjön el a fotoszintézis országa
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

export function Section1Content() {
  return (
    <>
      <p style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Moskát Anita</p>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '2rem', lineHeight: '1.3' }}>
        Jöjjön el a fotoszintézis országa<br />
        <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--ds-color-muted)' }}>(részletek)</span>
      </h1>
      <p>– Hát nem gyönyörű? – súgja oda Babér.</p>
      <p>A golfpályára tekint, a végtelen, folyton öntözött, pazarló gyepre, és tudom, hogy ő már nem öltönyös férfiakat lát egyre részegebben beszélgetni, hanem dús koronájú, ökológiai körforgásba illő, valódi erdőt. Le se kell hunynom a szemem, én is látom a kérgek göcsörtjeit, tenyerem összemérhetem a levelekkel.</p>
      <p>– De, az – felelem.</p>
      <p>Apám fái ezért nem tudtak elég gyorsan nőni: nem a megfelelő táptalajt választotta. A növekedéshez rengeteg energia kell. Drüasz lányainak magvai már úgy használják fel a húst és a vért, mint más növények a szikleveleket.</p>
    </>
  )
}

export function Section2Content() {
  return (
    <>
      <p>Miután a gyomorsav feloldja a védőburkot, a gyököcske a bélbolyhok közé ereszti ágait, megkapaszkodik a hasizomsejtek rostjai közt. A rügyecske ellenirányban nyújtózik, míg utat talál a hashártyáig és átdöfi azt. Növekvő hámsejtjei pihések, akár a megborzongó emberi bőr, szállítószövetei egybeforrnak az erekkel, egyetlen csepp vért sem hagynak a gyepre folyni, és végül minden csontgerenda, minden csigolyaív göcsörtté és tömör gesztté alakul, ahogy az mesterséges DNS-ében írva van. Sztómák nyílnak és csukódnak, mintha emberi tüdejét szívná tele az erdő a golfpálya helyén – tele lesz vele a sajtó, csodájára járnak a világ minden táján.</p>
      <p>Tudtad-e? A leggyorsabb fa akár öt óra alatt is képes elérni a kívánt törzsmagasságot.</p>
      <p style={{ fontStyle: 'italic' }}>…hisz te, a jóságos, nem csak a talajból, hanem szolgáid húsából, a bőr alól is megtalálod az utat…</p>
    </>
  )
}

export function Section3Content() {
  return (
    <>
      <p>Bekapcsolom a fülhallgatóm. Nem sikolyokat akarok hallani, öklendezést, vagy hasfalba döfött késeket, mintha még ki lehetne tépni a gyökerek szövedékét, akár a gyomot. A nyúló növényi sejtek cellulózropogására vágyom, mint apám laborjában, mintha még ott ülnék vele.</p>
      <p>Hiszen már hallom is. Olyan, akár a tábortűz.</p>
      <p>Lenyelem a számban tartogatott magot.</p>

      {/* Visual delimiter */}
      <div style={{ margin: '4rem 0 2rem 0', borderTop: '1px solid var(--ds-color-muted)', opacity: 0.3 }} />

      {/* CTA intro text */}
      <p style={{ fontSize: '1rem', color: 'var(--ds-color-muted)', textAlign: 'center', marginBottom: '2rem', lineHeight: 1.6 }}>
        Beszéljünk róla?
      </p>

      {/* CTA section */}
      <div style={{ textAlign: 'center' }}>
        <a
          href="https://cal.com/ferencz-csuszner/30-perces-online-beszelgetes"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '1rem 2.5rem',
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'var(--ds-color-background)',
            backgroundColor: 'var(--ds-color-accent)',
            borderRadius: '8px',
            textDecoration: 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 142, 35, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Beszéljünk
        </a>

        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--ds-color-muted)' }}>
          Vagy írj e-mailt: <a href="mailto:ferencz@pinelines.eu" style={{ color: 'var(--ds-color-accent)', textDecoration: 'none' }}>ferencz@pinelines.eu</a>
        </p>

        <p style={{ marginTop: '3rem', fontSize: '0.75rem', color: 'var(--ds-color-muted)', opacity: 0.6 }}>
          <a href="https://downstream.studio" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>downstream.studio</a> — scroll-driven storytelling
        </p>
      </div>
    </>
  )
}
