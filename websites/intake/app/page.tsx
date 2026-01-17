'use client'

import { useState, useRef, useEffect } from 'react'

// Options from schema
const TONE_OPTIONS = [
  'dark', 'light', 'dreamy', 'intense', 'calm', 'energetic',
  'mysterious', 'hopeful', 'melancholic', 'playful', 'dramatic', 'minimal'
]

const STYLE_OPTIONS = [
  'cinematic', 'painterly', 'photorealistic', 'abstract', 'illustrated',
  'minimalist', 'surreal', 'vintage', 'modern', 'fantasy', 'noir'
]

const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'it', name: 'Italian' },
]

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length
}

interface ProductionStatus {
  input: boolean
  production: boolean
  keyframes: number
  videos: number
  frames: number
  app: boolean
}

function ProductionPanel({ streamId }: { streamId: string }) {
  const [status, setStatus] = useState<ProductionStatus | null>(null)
  const [isProducing, setIsProducing] = useState(false)
  const [productionError, setProductionError] = useState('')
  const [productionSuccess, setProductionSuccess] = useState('')

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/produce?streamId=${streamId}`)
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (err) {
      console.error('Failed to fetch status:', err)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [streamId])

  const handleProduce = async () => {
    setIsProducing(true)
    setProductionError('')
    setProductionSuccess('')

    try {
      const res = await fetch('/api/produce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Production failed')
      }

      setProductionSuccess(`Production complete! App at: ${data.appPath}`)
      fetchStatus()
    } catch (err: any) {
      setProductionError(err.message)
    } finally {
      setIsProducing(false)
    }
  }

  return (
    <div className="form-section production-panel">
      <h2>Production Status</h2>

      {status && (
        <div className="status-grid">
          <div className={`status-item ${status.input ? 'complete' : ''}`}>
            <span className="status-icon">{status.input ? '✓' : '○'}</span>
            <span>input.json</span>
          </div>
          <div className={`status-item ${status.production ? 'complete' : ''}`}>
            <span className="status-icon">{status.production ? '✓' : '○'}</span>
            <span>production.json</span>
            {!status.production && (
              <span className="status-hint">Run create-production-spec skill</span>
            )}
          </div>
          <div className={`status-item ${status.keyframes > 0 ? 'complete' : ''}`}>
            <span className="status-icon">{status.keyframes > 0 ? '✓' : '○'}</span>
            <span>Keyframes: {status.keyframes}</span>
          </div>
          <div className={`status-item ${status.videos > 0 ? 'complete' : ''}`}>
            <span className="status-icon">{status.videos > 0 ? '✓' : '○'}</span>
            <span>Videos: {status.videos}</span>
          </div>
          <div className={`status-item ${status.frames > 0 ? 'complete' : ''}`}>
            <span className="status-icon">{status.frames > 0 ? '✓' : '○'}</span>
            <span>Frames: {status.frames}</span>
          </div>
          <div className={`status-item ${status.app ? 'complete' : ''}`}>
            <span className="status-icon">{status.app ? '✓' : '○'}</span>
            <span>Next.js App</span>
          </div>
        </div>
      )}

      {productionError && (
        <div className="error-message" style={{ marginTop: '1rem' }}>
          {productionError}
        </div>
      )}

      {productionSuccess && (
        <div className="success-message" style={{ marginTop: '1rem' }}>
          {productionSuccess}
          <br /><br />
          <code>cd stream-{streamId} && npm run dev</code>
        </div>
      )}

      <button
        type="button"
        className="submit-button"
        onClick={handleProduce}
        disabled={isProducing || !status?.production}
        style={{ marginTop: '1rem' }}
      >
        {isProducing && <span className="loading" />}
        {isProducing ? 'Producing... (this takes 20-30 min)' : 'Trigger Production'}
      </button>

      {status && !status.production && (
        <p className="status-hint" style={{ marginTop: '1rem', textAlign: 'center' }}>
          Waiting for production.json. Run the create-production-spec skill first.
        </p>
      )}
    </div>
  )
}

export default function IntakeForm() {
  // Form state
  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState('en')
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState('')
  const [tones, setTones] = useState<string[]>([])
  const [styles, setStyles] = useState<string[]>([])
  const [colors, setColors] = useState('')
  const [references, setReferences] = useState('')
  const [notes, setNotes] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [streamId, setStreamId] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const wordCount = countWords(text)
  const isValidWordCount = wordCount >= 800 && wordCount <= 3500

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setError('')

    // Create form data for file upload
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to extract text')
      }

      const data = await res.json()
      setText(data.text)

      // Auto-fill title from filename if empty
      if (!title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
        setTitle(nameWithoutExt.replace(/[-_]/g, ' '))
      }
    } catch (err: any) {
      setError(`Failed to extract text: ${err.message}`)
    }
  }

  const toggleTone = (tone: string) => {
    setTones(prev =>
      prev.includes(tone)
        ? prev.filter(t => t !== tone)
        : [...prev, tone]
    )
  }

  const toggleStyle = (style: string) => {
    setStyles(prev =>
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    // Validation
    if (!title.trim()) {
      setError('Title is required')
      setIsSubmitting(false)
      return
    }

    if (!text.trim()) {
      setError('Text content is required')
      setIsSubmitting(false)
      return
    }

    if (wordCount < 800) {
      setError(`Text is too short (${wordCount} words). Minimum 800 words required.`)
      setIsSubmitting(false)
      return
    }

    if (wordCount > 3500) {
      setError(`Text is too long (${wordCount} words). Maximum 3500 words. Consider splitting into multiple streams.`)
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          language,
          text: text.trim(),
          source: fileName ? {
            filename: fileName,
            format: fileName.split('.').pop()?.toLowerCase(),
          } : undefined,
          brief: {
            tone: tones.length > 0 ? tones : undefined,
            style: styles.length > 0 ? styles : undefined,
            colors: colors.trim() || undefined,
            references: references.trim() || undefined,
            notes: notes.trim() || undefined,
          },
          client: (clientName.trim() || clientEmail.trim()) ? {
            name: clientName.trim() || undefined,
            email: clientEmail.trim() || undefined,
          } : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit')
      }

      setStreamId(data.streamId)
      setSuccess(`Stream created successfully! ID: ${data.streamId}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container">
      <h1>DownStream Intake</h1>
      <p className="subtitle">Submit your content to create a visual story</p>

      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">
          {success}
          <br />
          <br />
          Input saved to: <code>streams/{streamId}/input.json</code>
        </div>
      )}

      {/* Show production panel after successful submission */}
      {streamId && <ProductionPanel streamId={streamId} />}

      {!streamId && (
        <form onSubmit={handleSubmit}>
          {/* Content Section */}
          <div className="form-section">
            <h2>Content</h2>

            <div className="form-group">
              <label>
                Title <span className="required">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., The Hunger"
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label>
                Language <span className="required">*</span>
              </label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                Upload Text File <span className="hint">(PDF, DOCX, TXT, MD)</span>
              </label>
              <div
                className={`file-upload ${fileName ? 'has-file' : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt,.md"
                  onChange={handleFileChange}
                />
                <div className="file-upload-icon">📄</div>
                <div className="file-upload-text">
                  Click to upload or drag and drop
                </div>
                {fileName && <div className="file-name">{fileName}</div>}
              </div>
            </div>

            <div className="form-group">
              <label>
                Text Content <span className="required">*</span>
                <span className="hint"> (800-3500 words)</span>
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type your story/content here..."
              />
              <div className={`word-count ${wordCount < 800 ? 'error' : wordCount > 3500 ? 'error' : 'success'}`}>
                {wordCount} words
                {wordCount < 800 && ` (need ${800 - wordCount} more)`}
                {wordCount > 3500 && ` (${wordCount - 3500} over limit)`}
              </div>
            </div>
          </div>

          {/* Creative Brief Section */}
          <div className="form-section">
            <h2>Creative Brief</h2>

            <div className="form-group">
              <label>Tone <span className="hint">(select all that apply)</span></label>
              <div className="checkbox-grid">
                {TONE_OPTIONS.map((tone) => (
                  <div
                    key={tone}
                    className={`checkbox-item ${tones.includes(tone) ? 'selected' : ''}`}
                    onClick={() => toggleTone(tone)}
                  >
                    <input
                      type="checkbox"
                      checked={tones.includes(tone)}
                      onChange={() => {}}
                    />
                    {tone}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Style <span className="hint">(select all that apply)</span></label>
              <div className="checkbox-grid">
                {STYLE_OPTIONS.map((style) => (
                  <div
                    key={style}
                    className={`checkbox-item ${styles.includes(style) ? 'selected' : ''}`}
                    onClick={() => toggleStyle(style)}
                  >
                    <input
                      type="checkbox"
                      checked={styles.includes(style)}
                      onChange={() => {}}
                    />
                    {style}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Colors <span className="hint">(describe your color preferences)</span></label>
              <input
                type="text"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                placeholder="e.g., Dark with warm amber accents, monochrome blue"
                maxLength={500}
              />
            </div>

            <div className="form-group">
              <label>References <span className="hint">(films, artists, other works)</span></label>
              <input
                type="text"
                value={references}
                onChange={(e) => setReferences(e.target.value)}
                placeholder="e.g., Tarkovsky films, Beksiński paintings"
                maxLength={1000}
              />
            </div>

            <div className="form-group">
              <label>Additional Notes <span className="hint">(any context or instructions)</span></label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., The void is a metaphor for hunger..."
                style={{ minHeight: '100px' }}
                maxLength={2000}
              />
            </div>
          </div>

          {/* Client Info Section */}
          <div className="form-section">
            <h2>Your Information <span className="hint">(optional)</span></h2>

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting || !isValidWordCount}
          >
            {isSubmitting && <span className="loading" />}
            {isSubmitting ? 'Creating Stream...' : 'Create Stream'}
          </button>
        </form>
      )}
    </div>
  )
}
