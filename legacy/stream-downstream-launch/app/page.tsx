import { StreamEngine } from '../../packages/engine/src'
import { streamConfig } from '../config'

export default function Home() {
  return <StreamEngine config={streamConfig} />
}
