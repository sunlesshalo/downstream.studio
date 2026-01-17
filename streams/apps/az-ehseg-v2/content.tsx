/**
 * Content components for Az Éhség V2 stream
 * EXACT text from original - 3 sections for continuous flow
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

export function IntroContent() {
  return (
    <>
      <h1>Az Éhség</h1>

      <p>
        Egyre aszó, üres gyomor az űr, évmilliónként ha még rándul egyet,
        aztán morog és korog hozzá, egészen úgy, mintha az ég dörögne,
        csak éppen hosszan, nagyon hosszan, közben megszületik az ember,
        felnő, és már magától értetődő a dörgés; bizonyára nem is lehetett
        másként, talán nem is volt egyéb hang soha.
      </p>

      <p>
        A gyermekeit úgy tanítja, a világ rendje ím ez; az ükunokák pedig
        előbb egymást, később magukat lövik főbe, mert a mégis elhaló zajt
        a világvége jóslatának vélik, ahogy a születések elmaradását is,
        vagy azt, hogy talpuk alól lassanként szétfoszlik a szilárd talaj.
      </p>

      <p>
        Szikladarabok úsznak át kusza összevisszaságban ott, ahol korábban
        bolygók billegték idétlen táncuk. Összeütköznek, darabokra hullanak,
        aztán más alakban állnak össze, vagy nem állnak össze soha,
        morzsolódnak egyre, de nem fogynak el. A pokolból nincs menekvés.
      </p>
    </>
  )
}

export function MainStoryContent() {
  return (
    <>
      <h2>Kis ház sziklával</h2>

      <p>
        Akár ez is lehetne a címe a színen átúszó kompozíciónak, ha törődne
        a címekkel még bárki, mert a színen valóban egy szikla úszik éppen át,
        rajta apró, fából tákolt ház, bentről fény szűrődik ki – gyertya lobog
        egy asztalon –, az ablakból pedig két arc bámul az egyre szűkülő,
        sötét végtelenbe, amit valaki pontosan úgy aggatott tele fénylő
        sztaniolgalacsinokkal, ahogy egykor a tövisszúró gébics tűzdelte fel
        a kökénybokrok tüskéire a szúnyogokat.
      </p>

      <p>
        Hogy ez az egykor elmúlt már, vagy el sem érkezett, még bizonytalan.
        Megerősítésért hiába fordulna bárki is a házban élőkhöz. Az ablakon túli,
        tompa tekintetük alapján akár vaknak is gondolhatnánk őket. A vakoknak
        pedig – valaha legalábbis úgy tartották – nincs időérzékük, így az idő
        mesterkedései rejtve maradnak előlük.
      </p>

      <p>
        A ház lakói nem vakok. Az idővel mégsem törődnek. A nappalok és éjszakák
        az űr kénye-kedve szerint változnak. Nem maradt már pálya, nem maradt
        forma sem, bolygók sem, hogy az előbbieknek értelme legyen. Csak apa és fia,
        ketten, tekintetükkel veszve a szűkülő sötét végtelenbe.
      </p>

      <p>
        Nagy elveszettségükben leginkább úgy állnak az őket körülvevő világhoz,
        mint a gyűjtögető állatok, vagy éppen, mint a gébics. Tartalékolnak,
        mert enni kell. A gyomor, ha kordul, nincs tekintettel emberre, állatra,
        időre, űrre, térre… Az űrre talán mégis. Az űr éhség.
      </p>

      <Dialogue>
        <p>– Szeretnéd, ha elmesélnék neked egy történetet? – kérdi az apa, és otthagyja az ablakot.</p>
        <p>– Nem.</p>
        <p>– Miért nem?</p>
        <p>A fiú az apjára néz, aztán újra kibámul az ablakon.</p>
        <p>– Miért nem?</p>
        <p>– Mert ezek a történetek nem igazak.</p>
        <p>– Nem kell igaznak lenniük, hiszen történetek.</p>
        <p>– Igen. De te mindig olyan történeteket mesélsz, amelyekben emberek vannak,
        és megváltó, és világ, és özönvíz, és állatok. Valójában semmi sincs –
        még mélyebbre próbálja fúrni tekintetét a sötétségbe.</p>
      </Dialogue>

      <p>
        A kis, fénylő galacsinokon túlra néz, bámul, amíg bele nem sajdul a feje.
      </p>

      <Dialogue>
        <p>– Miért nem mesélsz inkább te nekem egy történetet?</p>
        <p>– Nincs kedvem.</p>
        <p>– Jó.</p>
        <p>– Egyetlen történetem sincs, amit elmesélhetnék.</p>
      </Dialogue>

      <p>
        Ismét bámulnak, ismét a gyerek bírja tovább.
      </p>

      <Dialogue>
        <p>– Mit szeretnél vacsorázni?</p>
        <p>– Körtét – vágja rá megszokásból a fiú.</p>
        <p>– Jó választás.</p>
        <p>– Mindig ezt mondod.</p>
      </Dialogue>

      <p>
        Mielőtt a sötét raktárban rátalál az utolsó körtésdobozra, az apa egyesével
        vizsgálja végig a maradék gyümölcskonzerveket, a kezébe fogja, és úgy nyomkodja
        őket, mint aki a legérettebb darabokat akarja kiválogatni a gyümölcsöskosárból.
      </p>

      <p>
        Pontosan emlékszik még, miként nézett ki a helyiség kezdetekben: konzervek
        ládaszám egymásra pakolva. Paradicsom, őszibarack, bab, kajszi. Sonkakonzerv.
        Sózott marhahús. Több száz liter víz ötvenliteres műanyag kannákban.
        Gyümölcskoncentrátum, UHT tej, paradicsomlé, fűszerek, teák, kávék az egykori
        világ minden tájáról.
      </p>

      <Dialogue>
        <p>– Az utolsó – teszi az asztalra a dobozt, de a fiú nem mozdul.</p>
        <p>– A legutolsó.</p>
      </Dialogue>

      <p>
        A fiú az asztalhoz ül, kibontja a konzervet.
      </p>

      <Dialogue>
        <p>– Te nem eszel?</p>
        <p>– Eszem – mondja az apja.</p>
      </Dialogue>

      <p>
        Visszamegy a raktárba. Találomra nyúl a dobozok közé, megragad egyet, de visszateszi.
        A konyhába megy, gyertyát hoz. Megvilágítja a polcot. Csili, kukorica, sózott marhahús,
        raguk, levesek, spagettiszósz. Az összes dobozt ellenőrzi, de egyiket sem találja gyanúsnak.
        Néhány rozsdásabb darabot biztonságból kidob. Miközben esznek, a rozsdás dobozok
        tovasodródnak az űrben.
      </p>

      <Dialogue>
        <p>– Szerintem pedig akkor is jó. Szerintem ez akkor is egy egész jó történet.
        A semminél azért egy megváltó is jobb – mondja aztán a férfi.</p>
      </Dialogue>

      <p>
        A vacsora még tart, a fiú előtt álló, kifakult címkéjű doboz alján úszkál még
        néhány gyümölcsdarab.
      </p>

      <Dialogue>
        <p>– Jól van, apa. De most szeretnék egy kis nyugalmat.</p>
        <p>– Mi a helyzet az álmokkal? Régebben el szoktad mesélni az álmaidat.</p>
        <p>– Semmiről sincs kedvem beszélni.</p>
        <p>– Jól van.</p>
        <p>– Amúgy is mindig rosszat álmodom.</p>
      </Dialogue>

      <p>
        A fiú még befal néhány körtedarabot, aztán megszólal az ajtó fölé szerelt sárgaréz csengő.
      </p>

      <Dialogue>
        <p>– Kapás van – mondja az apa.</p>
        <p>– Szerintem csak a konzervek, amiket kidobtál. Sosem akad fenn egyéb.</p>
      </Dialogue>

      <p>
        Biztonságból megnézik.
      </p>

      <p>
        Az ablakból két arc leskelődik kifele. A szikladarab, rajta a kis házzal, hálót húz
        maga után. Egyik végét a sziklához rögzítették, a másik, akár az idő, szabadon nyúlik
        a végtelenbe. Szűk végtelen ez, legalábbis a hálóhoz viszonyítva mindenképp az.
        A félelmekből szőtt alkalmatosság minden egyes rezdülésekor súrolja a világ szegélyét.
      </p>

      <p>
        Igaz, most éppen nem is rezdül. Áldozata köré tekeredik, fogva tartja, amíg apa és fia
        kitanácskozhatják magukat a zsákmány sorsáról.
      </p>

      <Dialogue>
        <p>– Mi az? – kérdi a gyermek, és izgatottan kapaszkodik az ablakkeretbe.</p>
      </Dialogue>

      <p>
        Apja gondterhelt. Sosem látott még ilyet, de tudja, mi akadt fenn a hálón.
        Homlokát, orrát ráncolja. Talán morog is egy kicsit.
      </p>

      <Dialogue>
        <p>– Apa, mi az? – türelmetlenkedik a fiú.</p>
        <p>– Mentőcsónak.</p>
      </Dialogue>

      <p>
        És valóban, mintha a fémből és áttetsző reményből kovácsolt gubóban mozdulna valami.
      </p>

      <Dialogue>
        <p>– Mentőcsónak?</p>
      </Dialogue>

      <p>
        És a végtelen tovább zsugorodik.
      </p>

      <Dialogue>
        <p>– Az.</p>
      </Dialogue>

      <p>
        A gubóban ismét mozdul valami, ezúttal a háló is beleremeg. Végei rég túllógnak
        már a világmindenségen.
      </p>

      <Dialogue>
        <p>– Megmozdult! – sikít fel a gyerek, és maga sem tudja, hogy hangja a rémülettől
        vagy az kíváncsiság izgalmától vékonyodott el.</p>
        <p>– Ember van benne.</p>
        <p>– Ember?</p>
      </Dialogue>

      <p>Hallgatnak.</p>

      <Dialogue>
        <p>– Mint te meg én?</p>
      </Dialogue>

      <p>
        Hallgatnak. A végtelen elbizonytalanodik. Az apa fejben a konzerveket számolja.
      </p>

      <Dialogue>
        <p>– Mint...</p>
      </Dialogue>

      <p>
        Az utolsó darab körte az asztalon álló dobozban lassanként bomlásnak indul.
      </p>

      <Dialogue>
        <p>– Mint anya?</p>
      </Dialogue>

      <p>
        A por megtelepszik a raktárban felhalmozott konzervdobozok maradékán.
      </p>

      <Dialogue>
        <p>– Mint a megváltó?</p>
      </Dialogue>

      <p>
        A végtelen határa ismét szűkül. Közel van már a fennakadt mentőcsónakhoz.
        A háló méterei sercegve kerülnek a világ határain túlra.
      </p>

      <Dialogue>
        <p>– Apa?</p>
      </Dialogue>

      <p>
        Az apa még mindig számol. Újra- és újrakezdi. Valahol mindig sántít a számítás.
        Hol továbbvinni felejt el egy tízest, hol a maradékot nem kezeli jól egy osztás végén.
      </p>

      <Dialogue>
        <p>– Behúzzuk?</p>
      </Dialogue>

      <p>
        Az apa az asztalra bámul, az asztalon már csak a körtekonzerv maradéka.
        A dobozból áradó illat betölti a viskót. A fiú követi apja tekintetét.
      </p>

      <Dialogue>
        <p>– Behúzzuk? – kérdi ismét, ezúttal már sokkal bizonytalanabbul.</p>
      </Dialogue>

      <p>
        Bámulja a körtét, bámulja a csónakot, aminek a mélyén újra és újra mozdulni
        látszik az érkező. Az ajtó fölé szerelt sárgaréz csengő a háló minden rezdülésénél
        megcsendül. A végtelen lassan araszol egyre közelebb.
      </p>

      <Dialogue>
        <p>– Nem jön fel a cipőm – mondja az apa.</p>
      </Dialogue>

      <p>Hallgatnak.</p>

      <Dialogue>
        <p>– Bedagadt a lábam, nem jön fel rá.</p>
      </Dialogue>

      <p>Hallgatnak.</p>

      <Dialogue>
        <p>– Úgy kellene lehámozni a lábamról.</p>
      </Dialogue>

      <p>
        A fiú tekintete a konzerv és a csónak között ingázik. Hallgatnak.
        Aztán visszaül az asztal mellé. Befalja az utolsó gyümölcsdarabot.
        Hosszan rágja, nyelvével többször körbetaszigálja a szájában.
        Jobb volt az illata, mint az íze.
      </p>

      <p>
        Az apja is mellé ül. Nézi. A csengő nem csilingel tovább.
      </p>

      <Dialogue>
        <p>– Ne bámulj már, apa.</p>
        <p>– Jó – mondja az apa, aztán tovább bámulja.</p>
      </Dialogue>
    </>
  )
}

export function EpilogueContent() {
  return (
    <>
      <h2>Epilógus</h2>

      <p>
        <em>Egyre aszó, üres gyomor az űr, elképzelni sem szabad, miféle lényé lehetett.</em>
      </p>

      <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--ds-color-muted)' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--ds-color-muted)' }}>
          A DownStream Production<br />
          Test Production - December 2025
        </p>
      </div>
    </>
  )
}
