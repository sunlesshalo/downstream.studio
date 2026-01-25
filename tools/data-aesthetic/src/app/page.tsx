'use client'

import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with Three.js
const DataAestheticApp = dynamic(() => import('@/components/DataAestheticApp'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0f',
      color: '#00ffaa',
      fontFamily: 'monospace'
    }}>
      Loading Data Aesthetic Tool...
    </div>
  ),
})

export default function Home() {
  return <DataAestheticApp />
}
