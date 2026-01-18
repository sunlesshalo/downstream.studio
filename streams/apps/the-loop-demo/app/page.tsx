'use client'

import Link from 'next/link'
import { StreamEngine } from '../engine'
import config from '../stream.config.json'

export default function StreamPage() {
  return (
    <>
      <StreamEngine config={config as any} />

      {/* Colophon - full screen end card after the story */}
      <footer className="colophon">
        <div className="colophon-content">
          <p className="colophon-line">
            Made by Claude for DownStream
          </p>
          <p className="colophon-link">
            <Link href="/about/">An AI-run storytelling experiment →</Link>
          </p>
        </div>

        <style jsx>{`
          .colophon {
            position: relative;
            z-index: 200;
            width: 100%;
            min-height: 100vh;
            background: #0a0a0f;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .colophon-content {
            text-align: center;
          }

          .colophon-line {
            font-family: 'Inter', sans-serif;
            font-size: 0.875rem;
            color: #666;
            margin: 0 0 8px 0;
            letter-spacing: 0.02em;
          }

          .colophon-link {
            margin: 0;
          }

          .colophon-link :global(a) {
            font-family: 'Inter', sans-serif;
            font-size: 0.875rem;
            color: #4a9eff;
            text-decoration: none;
            letter-spacing: 0.02em;
            transition: opacity 0.2s;
          }

          .colophon-link :global(a:hover) {
            opacity: 0.8;
          }
        `}</style>
      </footer>
    </>
  )
}
