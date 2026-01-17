'use client'

import { useState, FormEvent } from 'react'

export interface FormField {
  name: string
  type: 'text' | 'email' | 'textarea'
  placeholder: string
  required: boolean
}

export interface ContactFormConfig {
  headline: string
  fields: FormField[]
  submit_text: string
  success_message: string
}

interface ContactFormProps {
  config: ContactFormConfig
  streamId: string
}

/**
 * Contact form component for stream CTAs
 * Submits to /api/contact endpoint
 */
export function ContactForm({ config, streamId }: ContactFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          streamId,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Something went wrong')
      }

      setStatus('success')
      setFormData({})
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (status === 'success') {
    return (
      <div className="ds-contact-form ds-contact-form--success">
        <style jsx>{formStyles}</style>
        <div className="ds-contact-form__success">
          <svg className="ds-contact-form__success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>{config.success_message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ds-contact-form">
      <style jsx>{formStyles}</style>

      <h2 className="ds-contact-form__headline">{config.headline}</h2>

      <form onSubmit={handleSubmit} className="ds-contact-form__form">
        {config.fields.map(field => (
          <div key={field.name} className="ds-contact-form__field">
            {field.type === 'textarea' ? (
              <textarea
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                value={formData[field.name] || ''}
                onChange={e => handleChange(field.name, e.target.value)}
                className="ds-contact-form__textarea"
                rows={4}
              />
            ) : (
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                value={formData[field.name] || ''}
                onChange={e => handleChange(field.name, e.target.value)}
                className="ds-contact-form__input"
              />
            )}
          </div>
        ))}

        {status === 'error' && (
          <div className="ds-contact-form__error">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          className="ds-contact-form__submit"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Sending...' : config.submit_text}
        </button>
      </form>
    </div>
  )
}

const formStyles = `
  .ds-contact-form {
    max-width: 480px;
  }

  .ds-contact-form__headline {
    font-family: var(--ds-font-heading);
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    color: var(--ds-color-text);
    margin: 0 0 0.5em 0;
    line-height: 1.1;
  }

  .ds-contact-form__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .ds-contact-form__field {
    width: 100%;
  }

  .ds-contact-form__input,
  .ds-contact-form__textarea {
    width: 100%;
    padding: 14px 16px;
    font-size: 1rem;
    font-family: var(--ds-font-body);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: var(--ds-color-text);
    transition: border-color 0.2s, background 0.2s;
  }

  .ds-contact-form__input::placeholder,
  .ds-contact-form__textarea::placeholder {
    color: var(--ds-color-text);
    opacity: 0.6;
  }

  .ds-contact-form__input:focus,
  .ds-contact-form__textarea:focus {
    outline: none;
    border-color: var(--ds-color-accent);
    background: rgba(255, 255, 255, 0.08);
  }

  .ds-contact-form__textarea {
    resize: vertical;
    min-height: 100px;
  }

  .ds-contact-form__submit {
    margin-top: 0.5rem;
    padding: 14px 32px;
    font-size: 1rem;
    font-weight: 600;
    font-family: var(--ds-font-body);
    background: var(--ds-color-accent);
    color: var(--ds-color-background);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    width: fit-content;
  }

  .ds-contact-form__submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
  }

  .ds-contact-form__submit:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .ds-contact-form__error {
    padding: 12px 16px;
    background: rgba(220, 53, 69, 0.1);
    border: 1px solid rgba(220, 53, 69, 0.3);
    border-radius: 8px;
    color: #ff6b6b;
    font-size: 0.9rem;
  }

  .ds-contact-form--success {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-height: 200px;
  }

  .ds-contact-form__success {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--ds-color-accent);
    font-size: 1.1rem;
  }

  .ds-contact-form__success-icon {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .ds-contact-form__success p {
    margin: 0;
  }
`
