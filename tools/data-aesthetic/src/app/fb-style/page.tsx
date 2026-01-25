'use client'

import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with Three.js
const FBStyleApp = dynamic(() => import('@/components/FBStyleApp'), {
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
      Loading FB Style Data Aesthetic...
    </div>
  ),
})

export default function FBStylePage() {
  return <FBStyleApp />
}
