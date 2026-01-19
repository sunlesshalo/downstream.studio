/**
 * Content components for Bolyai stream (English version)
 * Translated from Hungarian original
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

export function Chapter1Content() {
  return (
    <>
      <h1>The Two-Thousand-Year Riddle: Bolyai and Curved Space</h1>

      <h2>1. The Riddle</h2>
      <p>For two thousand years, no one found the answer. It wasn't about an ancient curse, nor about a map to lost treasure — just an infinitely simple question about lines. It was the kind of question any student might ask in a geometry class, yet history's greatest minds stumbled over it one after another.</p>
      <p><strong>Why are we certain that parallel lines never meet?</strong></p>
      <Dialogue><p>"Of course they don't meet!" you might say. "That's the very definition of parallel."</p></Dialogue>
      <p>And you'd be right, but mathematicians weren't satisfied with such an answer. They sought ultimate proof.</p>
      <p>Two thousand years ago, a Greek scholar named Euclid laid down the fundamental rules of geometry. He formulated five simple statements (axioms) from which everything else could be derived. The first four were crystal clear:</p>
      <ol style={{ margin: '1rem 0', paddingLeft: '1.5rem', lineHeight: '1.4' }}>
        <li style={{ marginBottom: '0.15rem' }}><strong>A line can be drawn between any two points.</strong></li>
        <li style={{ marginBottom: '0.15rem' }}><strong>Any line segment can be extended infinitely.</strong></li>
        <li style={{ marginBottom: '0.15rem' }}><strong>A circle can be drawn with any center and any radius.</strong></li>
        <li><strong>All right angles are equal.</strong></li>
      </ol>
      <p>But the fifth rule... it was entirely different. More complex, more cumbersome, as if it didn't belong with the others. This rule stated that parallel lines never intersect, but in such a convoluted way that it practically begged to be proven.</p>
      <p>For centuries, mathematicians were gnawed by doubt: if the other four rules were so elegant, why was the fifth so twisted? Was it truly a fundamental truth that could only be believed? Or could it be derived from the other four? Generations of Arab, Persian, Italian, and German scholars tried and failed. Then attention turned to a family in Transylvania.</p>
    </>
  )
}

export function Chapter2Content() {
  return (
    <>
      <h2>2. The Father: Farkas Bolyai</h2>
      <p>Farkas Bolyai was no ordinary man. A mathematician, inventor, musician, and poet rolled into one, he taught in Marosvásárhely. His students adored him because he didn't make them memorize — he taught them to think. But Farkas had a dark obsession: he too was possessed by the demon of parallel lines.</p>
      <p>As a young man, he corresponded with the "Prince of Mathematics," Carl Friedrich Gauss. Farkas firmly believed he would be the one to finally put an end to the two-thousand-year riddle. He hunched over papers through countless nights. Every time he thought he had the solution, he discovered a small, devastating flaw. Failure slowly eroded his self-esteem.</p>
      <p>Meanwhile, his son János grew up. The boy's genius showed early: he played violin at six, and by thirteen was studying university-level mathematics. Farkas was proud but also terrified, seeing that János's attention was turning to the same riddle that had ruined his own life.</p>
      <p>In 1820, Farkas wrote a dramatic letter to his son — one of the most moving documents in the history of science:</p>
      <Dialogue><p>"For God's sake, leave the doctrine of parallel lines alone... I have traveled this path to its end, and there is no happiness in it. All my attempts have failed, and my soul has sunk into darkness. Please, don't try it — you would waste your life, as I have wasted mine."</p></Dialogue>
      <p>But János did not listen to his father.</p>
    </>
  )
}

export function Chapter3_4Content() {
  return (
    <>
      <h2>3. The Heart of the Problem</h2>
      <p>To understand János's revolution, let's try an experiment. Take a sheet of paper. Draw a line, then a point above it, and through that point draw another line parallel to the first. Easy, right? The two lines never meet.</p>
      <p><strong>But what if your paper isn't flat?</strong> Imagine drawing on the surface of a basketball. If you start drawing two parallel lines from the ball's "equator" toward the north pole, they will meet at the top. Yet they started out parallel! This is called spherical geometry.</p>
      <p>Here's the brilliant twist: <strong>how do we know our world is "flat"?</strong> What if space itself — the entire universe — isn't like a smooth tabletop, but contains an invisible curvature? This was the question that changed everything.</p>

      <h2>4. The Breakthrough: "From Nothing, a New World"</h2>
      <p>János became a military officer, but by candlelight in the barracks, during breaks from marching, he still pondered parallel lines. But he approached it differently. He didn't ask: "How can I prove the fifth rule?" Instead, he asked: <strong>"What happens if it isn't true?"</strong></p>
      <p>What if there exists a geometry where parallel lines not only don't meet, but actively diverge from each other? János developed a system that at first seemed insane, yet worked perfectly, without contradictions. He built an entire mathematical universe that wasn't based on Euclid's rules.</p>
      <p>In 1823, he wrote the famous lines to his father:</p>
      <Dialogue><p>"From nothing, I have created a new, different world."</p></Dialogue>
      <p>Farkas could hardly believe what he read. His son had succeeded not because he was smarter, but because he had the courage to reject two thousand years of dogma. The result finally saw daylight in 1832, in a work titled <em>Appendix</em>. It was only twenty-six pages, but it shook science to its foundations.</p>
    </>
  )
}

export function Chapter5_6Content() {
  return (
    <>
      <h2>5. The Saddle-Shaped World</h2>
      <p>What did János discover? A space (called hyperbolic space) that most resembles a horse's saddle. In this world, the rules go mad:</p>
      <p>The sum of angles in a triangle is less than 180 degrees.</p>
      <p>Through a single point, infinitely many lines can be drawn parallel to a given line.</p>
      <p>This isn't just abstract math. Nature loves Bolyai geometry: look at the ruffles of a coral reef, the edge of a lettuce leaf, or certain mushroom caps — they all follow this hyperbolic form.</p>

      <h2>6. Vindication</h2>
      <p>János's success was bittersweet. When his work was sent to Gauss, the great scientist gave a cool response: he wrote that he couldn't praise János, because that would be praising himself — he claimed he had figured this out years earlier but hadn't dared to write it down. János collapsed, feeling betrayed, his discovery stolen. He never published again.</p>
      <p>But history delivered justice. Eighty years later, a young German physicist named Albert Einstein was investigating the secret of gravity. He realized that planets don't orbit due to invisible ropes: the Sun's mass simply curves space around it.</p>
      <p>For Einstein to describe how the universe works, he needed precisely the "curved" geometry that János Bolyai had created in the darkness of military barracks.</p>
      <p>János discovered what no one had for two thousand years before him: <strong>sometimes the greatest discovery comes not from proving what everyone believes to be true, but from questioning it.</strong></p>

      {/* CTA Button */}
      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <a
          href="https://downstream.studio"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.4)',
            backgroundColor: 'transparent',
            borderRadius: '8px',
            textDecoration: 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          a downstream.studio production
        </a>
      </div>
    </>
  )
}
