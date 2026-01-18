/**
 * Content components for Bolyai stream
 * AUTO-GENERATED from production.json sections
 * Text preserved exactly as stored in text_content
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
      <h1>A kétezer éves rejtély: Bolyai János és a meggörbült tér</h1>

      <h2>1. A rejtély</h2>
      <p>Van egy rejtély, amire kétezer éven át hiába kutatták a választ, senki sem talált rá. Pedig nem valami ősi átokról van szó, még csak nem is elásott kincsről – csupán egy egyszerű, vonalakkal kapcsolatos kérdésről. Annyira hétköznapi ez a kérdés, hogy bármelyikünk feltehette volna, sőt, te talán fel is tetted egy matekórán, mégis a történelem legnagyobb elméi közül sokan bicsaklottak bele sorra:</p>
      <p><strong>Tényleg biztos, hogy soha nem találkoznak a párhuzamos egyenesek?</strong></p>
      <Dialogue><p>„Persze, hogy nem találkoznak!" – vághatnád rá. „Éppen ez a párhuzamosság lényege."</p></Dialogue>
      <p>Végső soron, igazad is lenne, de azokat a matematikusokat, akikben a történelem folyamán felmerült ez a kérdés, nem olyan fából faragták, hogy megelégedtek volna egy ilyen válasszal. Ők ugyanis a végső bizonyítékot keresték.</p>
      <p>Kétezer évvel ezelőtt egy görög tudós, Euklidész, lefektette a geometria alapszabályait. Öt egyszerű állítást (axiómát) fogalmazott meg, amelyeket minden körülmény között igaznak tekintett, és amelyekből minden más szabályszerűség levezethető. Az első négy axióma kristálytisztának bizonyult, és leegyszerűsítve így hangzanak:</p>
      <ol style={{ margin: '1rem 0', paddingLeft: '1.5rem', lineHeight: '1.4' }}>
        <li style={{ marginBottom: '0.15rem' }}><strong>Bármely két pontot össze lehet kötni egyenessel.</strong></li>
        <li style={{ marginBottom: '0.15rem' }}><strong>Egy egyenes mindkét irányban végtelenül meghosszabbítható.</strong></li>
        <li style={{ marginBottom: '0.15rem' }}><strong>Bármely pont körül bármekkora sugárral kört lehet rajzolni.</strong></li>
        <li><strong>Minden derékszög egyenlő.</strong></li>
      </ol>
      <p>De az ötödik szabály... azaz <em>ha két, azonos síkban fekvő egyenes egy harmadik metsz, akkor a két egyenes a harmadiknak azon az oldalán metszi egymást, amelyiken a keletkezett belső szögek összege két derékszögnél kisebb</em>, kilógott a sorból.</p>
      <p>Bonyolultabbnak, nehézkesebbnek bizonyult a többi axiómánál. Ez a szabály mondja ki, hogy a párhuzamosok soha nem metszik egymást, de olyan bonyolultan, olyan körmönfont módon, hogy már-már gyanúsnak tűnt.</p>
      <p>A matematikusokat évszázadokon át mardosta a kétség: ha a többi négy szabály ilyen elegáns, miért ilyen nyakatekert az ötödik? Tényleg alapigazság, amit egyszerűen el kell hinni? Vagy levezethető a többi négyből? Arab, perzsa, olasz és német tudósok generációi próbálkoztak, és vallottak kudarcot. Aztán a rejtély egy erdélyi család figyelmének középpontjába került.</p>
    </>
  )
}

export function Chapter2Content() {
  return (
    <>
      <h2>2. Az apa: Bolyai Farkas</h2>
      <p>Bolyai Farkas nem mindennapi ember volt. Matematikus, feltaláló, zenész és költő egy személyben, aki Marosvásárhelyen tanított. A diákjai rajongtak érte, mert nem magoltatott, hanem gondolkodni tanított. Ám Farkasnak volt egy nyomasztó szenvedélye: megszállottan kutatta a párhuzamosok rejtélyének megfejtését.</p>
      <p>Fiatalon a „matematika fejedelmével", Carl Friedrich Gauss-szal levelezett. Farkas szentül hitte, hogy ő lesz az, aki végre pontot tesz a kétezer éves rejtély végére. Éjszakákon át görnyedt a papírok felett. Minden alkalommal, amikor azt hitte, megvan a megoldás, rájött egy apró, megsemmisítő hibára. A kudarc lassanként teljesen felőrölte az önbecsülését.</p>
      <p>Közben felnőtt a fia, János. A fiú zsenialitása már korán megmutatkozott: hatévesen hegedült, tizenhárom évesen pedig már egyetemi szintű matematikát tanult. Farkas büszke volt, de rettegett is, mert látta, hogy János figyelme ugyanazon rejtély felé fordul, ami az ő életére is árnyékot vetett.</p>
      <p>1820-ban Farkas drámai hangvételű levelet írt fiának, amely a tudománytörténet egyik legmegrázóbb dokumentuma:</p>
      <Dialogue><p>„Az Istenre kérlek, hagyj békét a párhuzamosok tanának... Én ezen az úton végigmentem, de nincs benne boldogság. Minden próbálkozásom kudarcot vallott, és a lelkem sötétségbe merült. Kérlek, ne próbáld meg – az életedet pazarolnád el, ahogy én tettem."</p></Dialogue>
      <p>De János nem hallgatott az apjára.</p>
    </>
  )
}

export function Chapter3_4Content() {
  return (
    <>
      <h2>3. A probléma lényege</h2>
      <p>Hogy megértsük János kutatásának lényegét, tegyünk egy próbát. Végy egy papírlapot. Húzz a lapra egy egyenest, az egyenes fölé rajzolj egy pontot, majd ezen a ponton keresztül rajzolj egy másik egyenest, ami párhuzamos az elsővel. Egyszerű, ugye? A két vonal sosem találkozik.</p>
      <p><strong>De mi van akkor, ha a papír nem teljesen lapos?</strong> Képzeld el, hogy egy kosárlabda felszínére rajzolsz. Ha a labda „egyenlítőjétől" elkezdesz két párhuzamos vonalat húzni az északi pólus felé, azok a csúcson találkozni fognak. Pedig párhuzamosként indultak! Ezt hívjuk gömbgeometriának.</p>
      <p>Itt jön a csavar: <strong>honnan tudjuk, hogy a világunk „lapos"?</strong> Mi van, ha maga a tér – az egész univerzum – nem olyan, mint egy sima asztallap, hanem van benne egy láthatatlan görbület? Ez a kérdés kezdte ki Euklidész ötödik axiómájának örökérvényűségét.</p>

      <h2>4. Az áttörés: „A semmiből egy új világ"</h2>
      <p>János katonatiszt lett, de a laktanyák gyertyafényénél, a menetelések szüneteiben is a párhuzamosokon töprengett. Ő azonban, apához, Farkashoz, és a kérdést kutató többi mateatikushoz képest máshonnan közelített. Nem azt kérdezte: „Hogyan bizonyítsam be az ötödik axiómát?", hanem azt: <strong>„Mi történik, ha nem igaz?"</strong></p>
      <p>Mi van, ha létezik egy olyan geometria, ahol a párhuzamosok nemhogy nem találkoznak, de egyenesen távolodnak egymástól? János kidolgozott egy rendszert, ami elsőre őrültségnek hangozhatott, mégis tökéletesen, ellentmondások nélkül működött. Felépített egy teljes matematikai univerzumot, amely nem Euklidész szabályaira épült.</p>
      <p>1823-ban írta meg apjának a híres sorokat:</p>
      <Dialogue><p>„A semmiből egy új, más világot teremtettem."</p></Dialogue>
      <p>Farkas alig hitte el, amit olvasott. A fia nem azért járt sikerrel, mert okosabb volt nála, hanem mert volt bátorsága megkérdőjelezni a kétezer éves dogmákat. Az eredmény végül 1832-ben, az <em>Appendix</em> című műben látott napvilágot. Mindössze huszonhat oldal volt, de alapjaiban rázta meg az akkori tudományos közeget.</p>
    </>
  )
}

export function Chapter5_6Content() {
  return (
    <>
      <h2>5. A nyereg alakú világ</h2>
      <p>Mit fedezett fel János? Egy olyan teret (úgynevezett hiperbolikus teret), ami leginkább egy lónyeregre hasonlít. Ebben a világban a szabályok összezavarodtak:</p>
      <p>A háromszög szögeinek összege kevesebb, mint 180 fok.</p>
      <p>Egy ponton keresztül végtelen sok párhuzamos húzható egy egyeneshez.</p>
      <p>Ez nem csupán elvont matek. A természet imádja a Bolyai-féle geometriát: ha megfigyeled egy korallzátony fodrait, egy salátalevél szélét vagy bizonyos gombák kalapját – mind-mind ezt a hiperbolikus formát követik.</p>

      <h2>6. Az igazságtétel</h2>
      <p>János sikere keserédes volt. Amikor elküldték művét Gaussnak, a nagyra becsült tudós hűvösen reagált: azt írta, nem dicsérheti Jánost, mert azzal önmagát dicsérné – állítása szerint ő már évekkel korábban rájött erre, csak nem merte leírni. János összeomlott, úgy érezte, elárulták és ellopták a felfedezését. Soha többé nem publikált semmit.</p>
      <p>A történelem azonban igazságot szolgáltatott a Bolyaiaknak. Nyolcvan évvel később egy fiatal német fizikus, Albert Einstein, a gravitáció titkát kutatta. Rájött, hogy a bolygók nem láthatatlan kötelek hatására keringenek. Az kényszeríti mozgásra őket, hogy a Nap hatalmas tömege szó szerint meggörbíti maga körül a teret.</p>
      <p>Einsteinnek ahhoz, hogy leírja a világegyetem működését, pontosan arra a „görbe" geometriára volt szüksége, amit Bolyai János alkotott meg a laktanyák homályában.</p>
      <p>János rájött arra, amit előtte kétezer évig senki: <strong>a legnagyobb felfedezéshez néha nem bizonyítani kell, amit mindenki igaznak tart, hanem megkérdőjelezni azt.</strong></p>

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
