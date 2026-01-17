'use client'

import { StreamEngine } from '../engine/components/StreamEngine'
import { streamConfig } from '../config'
import { AudioPlayer } from '../components/AudioPlayer'

export default function StreamPage() {
  return (
    <>
      <StreamEngine config={streamConfig} />
      <AudioPlayer />
    </>
  )
}
