/**
 * Content components for The Hunger stream
 * English translation - 3 sections for continuous flow
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
      <h1>The Hunger</h1>

      <p>
        The void is a shriveling, empty stomach; if it twitches once every few million years,
        it grumbles and growls, sounding exactly like thunder—only drawn out, interminably so.
        Meanwhile, man is born and grows up, and the thunder becomes a matter of course;
        surely it could not have been otherwise, perhaps there was never any other sound.
      </p>

      <p>
        He teaches his children that this is the order of the world; the great-great-grandchildren
        then shoot each other, and later themselves, in the head, because they mistake the fading
        noise for a prophecy of the apocalypse—as they do the cessation of births, or the way
        the solid ground gradually dissolves from beneath their feet.
      </p>

      <p>
        Chunks of rock float in tangled confusion where planets once swayed in their clumsy dance.
        They collide, fall to pieces, then reassemble in different forms, or never reassemble at all;
        they crumble perpetually, yet they never run out. There is no escape from hell.
      </p>
    </>
  )
}

export function MainStoryContent() {
  return (
    <>
      <h2>Small House with Rock</h2>

      <p>
        This could even be the title of the composition floating across the scene, if anyone
        still cared for titles, because a rock is indeed floating across the scene right now.
        On it sits a tiny house cobbled together from wood; light filters out from within—a candle
        flickers on a table—and from the window, two faces stare into the narrowing, dark infinity,
        which someone has hung with shining tinfoil balls, exactly the way the red-backed shrike
        once impaled mosquitoes upon the thorns of blackthorn bushes.
      </p>

      <p>
        Whether this "once" has already passed or has not yet arrived is still uncertain.
        One would turn to those living in the house for confirmation in vain. Judging by their
        dull gaze beyond the window, one might even think them blind. And the blind—at least
        so it was once held—have no sense of time; thus, the machinations of time remain hidden from them.
      </p>

      <p>
        The inhabitants of the house are not blind. Yet, they do not care for time. Days and nights
        change at the whim of the void. No orbits remain, no forms remain, nor planets, for the former
        to have any meaning. Only father and son, the two of them, their gazes lost in the narrowing dark.
      </p>

      <p>
        In their profound isolation, they relate to the world around them mostly like foraging animals,
        or indeed, like the shrike. They stockpile because one must eat. The stomach, when it growls,
        has no regard for man, animal, time, void, or space… Though perhaps for the void, it does.
        The void is hunger.
      </p>

      <Dialogue>
        <p>"Would you like me to tell you a story?" the father asks, leaving the window.</p>
        <p>"No."</p>
        <p>"Why not?"</p>
        <p>The boy looks at his father, then stares out the window again.</p>
        <p>"Why not?"</p>
        <p>"Because those stories aren't true."</p>
        <p>"They don't have to be true; they are stories."</p>
        <p>"Yes. But you always tell stories that have people in them, and a savior, and a world,
        and a flood, and animals. In reality, there is nothing." He tries to drive his gaze
        even deeper into the darkness.</p>
      </Dialogue>

      <p>
        He looks beyond the small, shining pellets, staring until his head begins to ache.
      </p>

      <Dialogue>
        <p>"Why don't you tell me a story instead?"</p>
        <p>"I don't feel like it."</p>
        <p>"Fine."</p>
        <p>"I don't have a single story I could tell."</p>
      </Dialogue>

      <p>
        They stare again; again, the child lasts longer.
      </p>

      <Dialogue>
        <p>"What would you like for supper?"</p>
        <p>"Pears," the boy retorts out of habit.</p>
        <p>"Good choice."</p>
        <p>"You always say that."</p>
      </Dialogue>

      <p>
        Before finding the last tin of pears in the dark storehouse, the father examines the remaining
        canned fruits one by one; he hefts them in his palm and squeezes them like someone trying
        to pick the ripest pieces from a fruit basket.
      </p>

      <p>
        He remembers exactly what the room looked like in the beginning: crates of cans stacked
        upon each other. Tomatoes, peaches, beans, apricots. Canned ham. Salted beef. Hundreds
        of liters of water in fifty-liter plastic canisters. Fruit concentrate, UHT milk, tomato juice,
        spices, teas, coffees from every corner of the former world.
      </p>

      <Dialogue>
        <p>"The last one," he says, placing the tin on the table, but the boy does not move.</p>
        <p>"The very last."</p>
      </Dialogue>

      <p>
        The boy sits at the table and opens the can.
      </p>

      <Dialogue>
        <p>"Aren't you eating?"</p>
        <p>"I'm eating," his father says.</p>
      </Dialogue>

      <p>
        He goes back to the storehouse. He reaches among the boxes at random, grabs one, but puts it back.
        He goes to the kitchen, brings a candle. He illuminates the shelf. Chili, corn, salted beef,
        stews, soups, spaghetti sauce. He checks all the tins, but finds none of them suspicious.
        He throws out a few rustier pieces just to be safe. While they eat, the rusty cans drift away in the void.
      </p>

      <Dialogue>
        <p>"I still think it's good. I think it's a pretty good story anyway.
        Even a savior is better than nothing," the man says eventually.</p>
      </Dialogue>

      <p>
        Supper is still ongoing; a few pieces of fruit still float at the bottom of the faded-label
        tin in front of the boy.
      </p>

      <Dialogue>
        <p>"All right, Father. But now I'd like some peace."</p>
        <p>"What about dreams? You used to tell me your dreams."</p>
        <p>"I don't feel like talking about anything."</p>
        <p>"All right."</p>
        <p>"I always have bad dreams anyway."</p>
      </Dialogue>

      <p>
        The boy wolfs down a few more pieces of pear, and then the brass bell mounted above the door rings.
      </p>

      <Dialogue>
        <p>"There's a catch," the father says.</p>
        <p>"I think it's just the cans you threw out. Nothing else ever gets caught."</p>
      </Dialogue>

      <p>
        They check, just to be safe.
      </p>

      <p>
        Two faces peer out from the window. The chunk of rock, with the little house upon it,
        drags a net behind itself. One end is fixed to the rock; the other, like time, stretches
        freely into infinity. This is a narrow infinity—at least compared to the net, it certainly is.
        This contraption woven from fears brushes against the edge of the world with every single quiver.
      </p>

      <p>
        True, right now it isn't even quivering. It wraps around its victim, holding it fast,
        until father and son can deliberate over the fate of the prey.
      </p>

      <Dialogue>
        <p>"What is it?" the child asks, clinging to the window frame in excitement.</p>
      </Dialogue>

      <p>
        The father is troubled. He has never seen anything like this, but he knows what has been
        caught in the net. He wrinkles his forehead and nose. Perhaps he even grumbles a little.
      </p>

      <Dialogue>
        <p>"Father, what is it?" the boy grows impatient.</p>
        <p>"A lifeboat."</p>
      </Dialogue>

      <p>
        And indeed, it is as if something is moving inside the cocoon forged of metal and translucent hope.
      </p>

      <Dialogue>
        <p>"A lifeboat?"</p>
      </Dialogue>

      <p>
        And infinity shrinks further.
      </p>

      <Dialogue>
        <p>"That's it."</p>
      </Dialogue>

      <p>
        Something moves again in the cocoon; this time, even the net trembles. Its ends have long
        since overshot the universe.
      </p>

      <Dialogue>
        <p>"It moved!" the child screams, his voice thinning with a mixture of terror and curiosity.</p>
        <p>"There's a person inside."</p>
        <p>"A person?"</p>
      </Dialogue>

      <p>They are silent.</p>

      <Dialogue>
        <p>"Like you and me?"</p>
      </Dialogue>

      <p>
        They are silent. Infinity falters. In his head, the father is counting the cans.
      </p>

      <Dialogue>
        <p>"Like…"</p>
      </Dialogue>

      <p>
        The last piece of pear in the tin on the table slowly begins to decompose.
      </p>

      <Dialogue>
        <p>"Like Mother?"</p>
      </Dialogue>

      <p>
        The dust settles on the remains of the canned goods piled in the storehouse.
      </p>

      <Dialogue>
        <p>"Like the savior?"</p>
      </Dialogue>

      <p>
        The boundary of infinity narrows again. It is close now to the snagged lifeboat.
        Meters of the net pass crackling beyond the boundaries of the world.
      </p>

      <Dialogue>
        <p>"Father?"</p>
      </Dialogue>

      <p>
        The father is still counting. He starts over and over again. The calculation is always
        flawed somewhere. Sometimes he forgets to carry a ten; sometimes he fails to manage
        the remainder at the end of a division.
      </p>

      <Dialogue>
        <p>"Do we pull it in?"</p>
      </Dialogue>

      <p>
        The father stares at the table; on the table, only the remains of the canned pears are left.
        The scent emanating from the tin fills the shack. The boy follows his father's gaze.
      </p>

      <Dialogue>
        <p>"Do we pull it in?" he asks again, this time much more uncertainly.</p>
      </Dialogue>

      <p>
        He stares at the pear, stares at the boat, in the depths of which the newcomer seems to move
        again and again. The brass bell above the door rings with every tremor of the net.
        Infinity inches slowly closer.
      </p>

      <Dialogue>
        <p>"My shoe won't go on," the father says.</p>
      </Dialogue>

      <p>They are silent.</p>

      <Dialogue>
        <p>"My foot is swollen; it won't go on."</p>
      </Dialogue>

      <p>They are silent.</p>

      <Dialogue>
        <p>"I'd have to peel it off my foot."</p>
      </Dialogue>

      <p>
        The boy's gaze oscillates between the tin and the boat. They are silent.
        Then he sits back down at the table. He devours the last piece of fruit.
        He chews it for a long time, pushing it around his mouth with his tongue, stalling.
        Its scent was better than its taste.
      </p>

      <p>
        His father sits beside him too. He watches him. The bell rings no more.
      </p>

      <Dialogue>
        <p>"Stop staring, Father."</p>
        <p>"All right," the father says, and then continues to stare.</p>
      </Dialogue>
    </>
  )
}

export function EpilogueContent() {
  return (
    <>
      <h2>Epilogue</h2>

      <p>
        <em>The void is a shriveling, empty stomach; one must not even imagine what kind of creature it could have belonged to.</em>
      </p>

      <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--ds-color-muted)' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--ds-color-muted)' }}>
          Ferencz Csuszner<br />
          Originally published in Hungarian in Bárka XXIII. 2015/4.
        </p>
        <p style={{ fontSize: '0.9rem', color: 'var(--ds-color-muted)', marginTop: '2rem' }}>
          A <a href="https://www.downstream.studio/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>DownStream.Studio</a> Production
        </p>
      </div>
    </>
  )
}
