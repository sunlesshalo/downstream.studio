'use client'

import { StreamEngine } from '../engine'
import { streamConfig } from '../config'

export default function StreamPage() {
  return <StreamEngine config={streamConfig} />
}
