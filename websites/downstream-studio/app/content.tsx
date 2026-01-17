/**
 * Content components for Az Ehseg stream
 * Embedded directly in landing page
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
      <h1>Az Ehseg</h1>

      <p>
        Egyre aszo, ures gyomor az ur, evmillionkent ha meg randul egyet,
        aztan morog es korog hozza, egeszen ugy, mintha az eg dorogne,
        csak eppen hosszan, nagyon hosszan, kozben megszuletik az ember,
        felno, es mar magatol ertetodo a dorges; bizonyara nem is lehetett
        maskent, talan nem is volt egyeb hang soha.
      </p>

      <p>
        A gyermekeit ugy tanitja, a vilag rendje im ez; az ukukonokak pedig
        elobb egymast, kesobb magukat lovik fobe, mert a megis elhalo zajt
        a vilagvege joslataanak velik, ahogy a szuletesek elmaradasat is,
        vagy azt, hogy talpuk alol lassankent szetfoszlik a szilard talaj.
      </p>

      <p>
        Szikladarabok usznak at kusza osszevisszasagban ott, ahol korabban
        bolygok billegtek idetlen tancuk. Osszeukoznek, darabokra hullanak,
        aztan mas alakban allnak ossze, vagy nem allnak ossze soha,
        morzsolodnak egyre, de nem fogynak el. A pokolbol nincs menekves.
      </p>
    </>
  )
}

export function MainStoryContent() {
  return (
    <>
      <h2>Kis haz sziklaval</h2>

      <p>
        Akar ez is lehetne a cime a szinen atuszo kompozicionak, ha torodne
        a cimekkel meg barki, mert a szinen valoban egy szikla uszik eppen at,
        rajta apro, fabol takolt haz, bentrol feny szurodok ki - gyertya lobog
        egy asztalon -, az ablakbol pedig ket arc bamul az egyre szukulo,
        sotet vegtelenbe, amit valaki pontosan ugy aggatott tele fenylo
        sztaniol galacsinokkal, ahogy egykor a tovisszuro gebics tuzdelte fel
        a kokenybokrok tuskeire a szunyogokat.
      </p>

      <p>
        Hogy ez az egykor elmult mar, vagy el sem erkezett, meg bizonytalan.
        Megerositesert hiaba fordulna barki is a hazban elokhoz. Az ablakon tuli,
        tompa tekintetuk alapjan akar vaknak is gondolhatnank oket. A vakoknak
        pedig - valaha legalabbis ugy tartottak - nincs idoerzekuk, igy az ido
        mesterkedesei rejtve maradnak eloluk.
      </p>

      <p>
        A haz lakoi nem vakok. Az idovel megsem torodnek. A nappalok es ejszakak
        az ur kenye-kedve szerint valtoznak. Nem maradt mar palya, nem maradt
        forma sem, bolygok sem, hogy az elobbieknek ertelme legyen. Csak apa es fia,
        ketten, tekintetukkel veszve a szukulo sotet vegtelenbe.
      </p>

      <p>
        Nagy elveszettegukben leginkabb ugy allnak az oket korulvevo vilaghoz,
        mint a gyujtogeto allatok, vagy eppen, mint a gebics. Tartalekolnak,
        mert enni kell. A gyomor, ha kordul, nincs tekintettel emberre, allatra,
        idore, urre, terre... Az urre talan megis. Az ur ehseg.
      </p>

      <Dialogue>
        <p>- Szeretned, ha elmeselnek neked egy tortenetet? - kerdi az apa, es otthagyja az ablakot.</p>
        <p>- Nem.</p>
        <p>- Miert nem?</p>
        <p>A fiu az apjara nez, aztan ujra kibamul az ablakon.</p>
        <p>- Miert nem?</p>
        <p>- Mert ezek a tortenetek nem igazak.</p>
        <p>- Nem kell igaznak lenniuk, hiszen tortenetek.</p>
        <p>- Igen. De te mindig olyan torteneteket meselel, amelyekben emberek vannak,
        es megvalto, es vilag, es ozonviz, es allatok. Valojaban semmi sincs -
        meg melyebbre probalja furni tekintetet a sotetsegbe.</p>
      </Dialogue>

      <p>
        A kis, fenylo galacsinokon tulra nez, bamul, amig bele nem sajdul a feje.
      </p>

      <Dialogue>
        <p>- Miert nem meselel inkabb te nekem egy tortenetet?</p>
        <p>- Nincs kedvem.</p>
        <p>- Jo.</p>
        <p>- Egyetlen tortenetem sincs, amit elmeselhetnek.</p>
      </Dialogue>

      <p>
        Ismet bamulnak, ismet a gyerek birja tovabb.
      </p>

      <Dialogue>
        <p>- Mit szeretnel vacsorazni?</p>
        <p>- Kortet - vagja ra megszokasbol a fiu.</p>
        <p>- Jo valasztas.</p>
        <p>- Mindig ezt mondod.</p>
      </Dialogue>

      <p>
        Mielott a sotet raktarban ratalal az utolso kortesdobozra, az apa egyesevel
        vizsgalja vegig a maradek gyumolcskonzerveket, a kezebe fogja, es ugy nyomkodja
        oket, mint aki a legerettebb darabokat akarja kivalogatni a gyumolcoskosarbol.
      </p>

      <p>
        Pontosan emlekszik meg, mikent nezett ki a helyiseg kezdetekben: konzervek
        ladaszam egymasra pakolva. Paradicsom, oszibarack, bab, kajszi. Sonkakonzerv.
        Sozott marhahus. Tobb szaz liter viz otvenliteres muanyag kannakban.
        Gyumolcskoncentratum, UHT tej, paradicsomle, fuszerek, teak, kavek az egykori
        vilag minden tajarol.
      </p>

      <Dialogue>
        <p>- Az utolso - teszi az asztalra a dobozt, de a fiu nem mozdul.</p>
        <p>- A legutolso.</p>
      </Dialogue>

      <p>
        A fiu az asztalhoz ul, kibontja a konzervet.
      </p>

      <Dialogue>
        <p>- Te nem eszel?</p>
        <p>- Eszem - mondja az apja.</p>
      </Dialogue>

      <p>
        Visszamegy a raktarba. Talalomra nyul a dobozok koze, megragad egyet, de visszateszi.
        A konyhaba megy, gyertyat hoz. Megvilagitja a polcot. Csili, kukorica, sozott marhahus,
        raguk, levesek, spagettiszosz. Az osszes dobozt ellenorzi, de egyiket sem talalja gyanusnak.
        Nehany rozsdasabb darabot biztonsagbol kidob. Mikozben esznek, a rozsdas dobozok
        tovasodrodnak az urben.
      </p>

      <Dialogue>
        <p>- Szerintem pedig akkor is jo. Szerintem ez akkor is egy egesz jo tortenet.
        A semminél azert egy megvalto is jobb - mondja aztan a ferfi.</p>
      </Dialogue>

      <p>
        A vacsora meg tart, a fiu elott allo, kifakult cimkeju doboz aljan uszkak meg
        nehany gyumolcsdarab.
      </p>

      <Dialogue>
        <p>- Jol van, apa. De most szeretnek egy kis nyugalmat.</p>
        <p>- Mi a helyzet az almokkal? Regebben el szoktad meselni az almaidat.</p>
        <p>- Semmirol sincs kedvem beszelni.</p>
        <p>- Jol van.</p>
        <p>- Amugy is mindig rosszat almodom.</p>
      </Dialogue>

      <p>
        A fiu meg befal nehany kortedarabot, aztan megszolal az ajto fole szerelt sargarez csengo.
      </p>

      <Dialogue>
        <p>- Kapas van - mondja az apa.</p>
        <p>- Szerintem csak a konzervek, amiket kidobtal. Sosem akad fenn egyeb.</p>
      </Dialogue>

      <p>
        Biztonsagbol megnezik.
      </p>

      <p>
        Az ablakbol ket arc leskelodik kifele. A szikladarab, rajta a kis hazzal, halot huz
        maga utan. Egyik veget a sziklahoz rogzitettek, a masik, akar az ido, szabadon nyulik
        a vegtelenbe. Szuk vegtelen ez, legalabbis a halohoz viszonyitva mindenkepp az.
        A felelmekbol szott alkalmatossag minden egyes rezdulesekor surolja a vilag szegelyet.
      </p>

      <p>
        Igaz, most eppen nem is rezdul. Aldozata kore tekeredik, fogva tartja, amig apa es fia
        kitanacskozhatjak magukat a zsakmany sorsarol.
      </p>

      <Dialogue>
        <p>- Mi az? - kerdi a gyermek, es izgatottan kapaszkodik az ablakkeretbe.</p>
      </Dialogue>

      <p>
        Apja gondterhelt. Sosem latott meg ilyet, de tudja, mi akadt fenn a halon.
        Homlokat, orrat rancolja. Talan morog is egy kicsit.
      </p>

      <Dialogue>
        <p>- Apa, mi az? - turelmetlenkedik a fiu.</p>
        <p>- Mentocsanak.</p>
      </Dialogue>

      <p>
        Es valoban, mintha a fembol es attetzo remenybol kovacsolt guboban mozdulna valami.
      </p>

      <Dialogue>
        <p>- Mentocsanak?</p>
      </Dialogue>

      <p>
        Es a vegtelen tovabb zsugorodik.
      </p>

      <Dialogue>
        <p>- Az.</p>
      </Dialogue>

      <p>
        A guboban ismet mozdul valami, ezuttal a halo is beleremeg. Vegei reg tullongnak
        mar a vilagmindsegen.
      </p>

      <Dialogue>
        <p>- Megmozdult! - sikit fel a gyerek, es maga sem tudja, hogy hangja a remuletol
        vagy az kivancsisag izgalmatol vekonyodott el.</p>
        <p>- Ember van benne.</p>
        <p>- Ember?</p>
      </Dialogue>

      <p>Hallgatnak.</p>

      <Dialogue>
        <p>- Mint te meg en?</p>
      </Dialogue>

      <p>
        Hallgatnak. A vegtelen elbizonytalanodik. Az apa fejben a konzerveket szamolja.
      </p>

      <Dialogue>
        <p>- Mint...</p>
      </Dialogue>

      <p>
        Az utolso darab korte az asztalon allo dobozban lassankent bomlatnak indul.
      </p>

      <Dialogue>
        <p>- Mint anya?</p>
      </Dialogue>

      <p>
        A por megtelepszik a raktarban felhalmozott konzervdobozok maradekan.
      </p>

      <Dialogue>
        <p>- Mint a megvalto?</p>
      </Dialogue>

      <p>
        A vegtelen hatara ismet szukul. Kozel van mar a fennakadt mentocsanakhoz.
        A halo meterei sercegve kerulnek a vilag hataran tulra.
      </p>

      <Dialogue>
        <p>- Apa?</p>
      </Dialogue>

      <p>
        Az apa meg mindig szamol. Ujra- es ujrakezdi. Valahol mindig santit a szamitas.
        Hol tovabbvinni felejt el egy tizest, hol a maradekot nem kezeli jol egy osztas vegen.
      </p>

      <Dialogue>
        <p>- Behuzzuk?</p>
      </Dialogue>

      <p>
        Az apa az asztalra bamul, az asztalon mar csak a kortekonzerv maradeka.
        A dobozbol arado illat betolti a viskot. A fiu koveti apja tekintetet.
      </p>

      <Dialogue>
        <p>- Behuzzuk? - kerdi ismet, ezuttal mar sokkal bizonytalanabbul.</p>
      </Dialogue>

      <p>
        Bamulja a kortet, bamulja a csonakot, aminek a melyen ujra es ujra mozdulni
        latszik az erkezo. Az ajto fole szerelt sargarez csengo a halo minden rezdulesenel
        megcsendul. A vegtelen lassan araszol egyre kozelebb.
      </p>

      <Dialogue>
        <p>- Nem jon fel a cipom - mondja az apa.</p>
      </Dialogue>

      <p>Hallgatnak.</p>

      <Dialogue>
        <p>- Bedagadt a labam, nem jon fel ra.</p>
      </Dialogue>

      <p>Hallgatnak.</p>

      <Dialogue>
        <p>- Ugy kellene lehamozni a labamrol.</p>
      </Dialogue>

      <p>
        A fiu tekintete a konzerv es a csonak kozott ingazik. Hallgatnak.
        Aztan visszaul az asztal melle. Befalja az utolso gyumolcsdarabot.
        Hosszan ragja, nyelvevel tobbszor korbe-taszigalja a szajaban.
        Jobb volt az illata, mint az ize.
      </p>

      <p>
        Az apja is melle ul. Nezi. A csengo nem csilingel tovabb.
      </p>

      <Dialogue>
        <p>- Ne bamulj mar, apa.</p>
        <p>- Jo - mondja az apa, aztan tovabb bamulja.</p>
      </Dialogue>
    </>
  )
}

export function EpilogueContent() {
  return (
    <>
      <h2>Epilogus</h2>

      <p>
        <em>Egyre aszo, ures gyomor az ur, elkepzelni sem szabad, mifele lenye lehetett.</em>
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
