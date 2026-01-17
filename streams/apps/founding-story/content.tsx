/**
 * Content components for The Vessel and the Sea
 */

import { ContactForm } from './engine/components/ContactForm'

export const openingContent = {
  heading: 'We All Have a Story',
  body: (
    <>
      <p>We all have a story to tell.</p>
      <p>Yours might be the private promise you made yourself at a kitchen table before you ever hired your first employee. It might be the cause that is currently breaking your heart, piece by piece, yet you keep going—perhaps because you've realized that a broken heart is the entry fee for saving a small corner of the world. Or perhaps it is something more intimate: a secret you want to leave for your child, a map to help them find their way in a world that grows harder to believe in with every passing year.</p>
      <p>We all have a story to tell.</p>
      <p>Mine is about the sobering realization that not all the stories worth telling are my own.</p>
      <p>I was a storyteller for most of my life. I inhabited the world of short stories, plays, and reviews—stories about other people's stories. It was work that required a specific kind of devotion: time, craft, and an almost religious commitment to practice. But most importantly, it was work that required a witness. A story without a reader is just ink on a page; it's a circuit that never closes.</p>
    </>
  )
}

export const theStoppingContent = {
  heading: 'The Stopping',
  body: (
    <>
      <p>Then, I stopped.</p>
      <p>I didn't stop because I ran out of things to say. I stopped because the cost of creating had grown higher than the cost of staying silent. Some people burn out in public, spectacularly. I chose a different path. I quietly stepped back and waited for a time when the pain of not writing finally outweighed the pain of writing itself.</p>
      <p>That time hasn't come yet. But I never actually left the orbit of storytelling. I just started circling it from a safe distance—close enough to watch the flames, far enough so they couldn't bite.</p>
      <p>I moved into Marketing, where narrative is stripped down and weaponized as strategy. I explored Games, where the reader shapes the ending. I watched the rise of AI, which generates everything and means nothing by any of it.</p>
      <p>And the whole time, I kept seeing the same thing: people with stories that mattered—stories that deserved to land—watching their work disappear into the noise.</p>
    </>
  )
}

export const architectureOfErasureContent = {
  heading: 'The Architecture of Erasure',
  body: (
    <>
      <p>The platforms we use to share our lives were never built for stories. They were built for attention.</p>
      <p>Attention captured. Attention measured. Attention sold.</p>
      <p>That is the product. The algorithms do not care about meaning. They do not care about resonance. They do not care about the moment when a story finally lands and a reader thinks, <em>yes, someone understands</em>. They care only if you stay long enough to monetize, then redirect you to the next flickering light.</p>
      <p>There is a layer on top of everything now—algorithmic, relentless, infinite. It decides what gets seen and what vanishes. It doesn't care if your story is true or took you a decade to shape. It cares if it stops a thumb for three seconds.</p>
      <p>Your story isn't failing because it isn't good enough. It's failing because the entire infrastructure is designed to keep people swimming—always moving, never arriving. Endless scroll. Infinite feed.</p>
      <p>But beneath that churn, something remains.</p>
    </>
  )
}

export const yearningForTheSeaContent = {
  heading: 'The Yearning for the Sea',
  body: (
    <>
      <p>There is a line from Antoine de Saint-Exupéry that has been with me for years:</p>
      <blockquote>"If you want to build a ship, don't drum up the men to gather wood, divide the work, and give orders. Instead, teach them to yearn for the vast and endless sea."</blockquote>
      <p>For a long time, I didn't know what to do with that quote. It sat in the back of my mind, fueling a restlessness I couldn't name. I tried to forget it.</p>
      <p>I was building dashboards—clean, cold grids of information—when the question finally formed. If we can describe data and watch an AI draw it, why can't we do that for a story?</p>
      <p>But stories are not data. You don't consume a story the way you consume a chart. Stories have rhythm, pacing, and weight that builds across time. The visual layer couldn't just be decoration—it had to move with the narrative.</p>
      <p>I started looking at the pieces scattered across different disciplines: image generation, video with keyframe control, scroll-driven web technology. I began assembling them into something I hadn't seen before.</p>
      <p>Not a tool. A contribution. A way to help stories land differently.</p>
    </>
  )
}

export const introducingDownstreamContent = {
  heading: 'Introducing Downstream',
  body: (
    <>
      <p>As you scroll, the animation responds to you. Not video imposing its rhythm. Not static images sitting dead on a page. Movement that follows your lead. It holds when you pause. It lets you retreat and revisit.</p>
      <p>You can drift through slowly if the story is meditative. Race through if the urgency demands it. When the story speaks of descent, the world on your screen descends with you.</p>
      <p>You are no longer being fed a story. You are moving through it.</p>
      <p>The words remain yours. My work is to build the current around them.</p>
      <p>I call it Downstream—a name born from that Saint-Exupéry yearning. You don't have to fight the water to get where you're going. You just need the right vessel.</p>
      <p>I built Downstream to be the ship that carries yearning people toward their sea—a sea that surges, swells, heaves, and roars with stories that actually matter.</p>
      <p><strong>The ship leaves at dawn. Join me—we're sailing downstream.</strong></p>
    </>
  )
}

export function ContactContent() {
  return (
    <ContactForm
      config={{"headline": "Let's Build Your Stream", "fields": [{"name": "name", "type": "text", "placeholder": "Your name", "required": true}, {"name": "email", "type": "email", "placeholder": "Your email", "required": true}, {"name": "story", "type": "textarea", "placeholder": "Tell us about your story", "required": false}], "submit_text": "Share Your Story", "success_message": "Thank you! We'll be in touch soon."}}
      streamId="founding-story"
    />
  )
}
