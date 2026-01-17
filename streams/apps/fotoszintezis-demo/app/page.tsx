'use client'

import { StreamEngine } from '../engine/components/StreamEngine'
import { streamConfig } from '../config'

export default function StreamPage() {
  return <StreamEngine config={streamConfig} />
}
