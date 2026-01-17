'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { getTranslations, locales, localeNames, demoUrls, type Locale } from '../../i18n'
import Link from 'next/link'

function LanguageSwitcher({ currentLang }: { currentLang: Locale }) {
  return (
    <nav className="language-switcher">
      {locales.map((locale) => (
        <Link
          key={locale}
          href={`/${locale}`}
          className={`lang-link ${locale === currentLang ? 'active' : ''}`}
        >
          {localeNames[locale]}
        </Link>
      ))}
      <style jsx>{`
        .language-switcher {
          position: fixed;
          top: 24px;
          right: 24px;
          display: flex;
          gap: 16px;
          z-index: 100;
        }
        .lang-link {
          color: #666;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s;
        }
        .lang-link:hover {
          color: #0a0a0f;
        }
        .lang-link.active {
          color: #0a0a0f;
          font-weight: 500;
        }
        @media (max-width: 640px) {
          .language-switcher {
            top: 16px;
            right: 16px;
            gap: 12px;
          }
          .lang-link {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </nav>
  )
}

export default function LocalizedHome() {
  const params = useParams()
  const lang = (params?.lang as Locale) || 'en'
  const t = getTranslations(lang)
  const demoUrl = demoUrls[lang]

  const [formData, setFormData] = useState({
    email: '',
    title: '',
    story: '',
    style: 'art-film',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Something went wrong. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen">
      <LanguageSwitcher currentLang={lang} />

      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif leading-tight mb-8">
          {t.hero.title1}<br />
          <span className="text-muted">{t.hero.title2}</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted max-w-2xl mb-12 leading-relaxed">
          {t.hero.subtitle}
        </p>
        <a
          href="#start"
          className="inline-block bg-ink text-cream px-8 py-4 text-lg hover:bg-muted transition-colors w-fit"
        >
          {t.hero.cta}
        </a>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 md:px-12 lg:px-24 border-t border-ink/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif mb-16">{t.howItWorks.title}</h2>

          <div className="space-y-16">
            <div className="grid md:grid-cols-[120px_1fr] gap-6">
              <span className="text-6xl font-serif text-muted/30">01</span>
              <div>
                <h3 className="text-2xl mb-4">{t.howItWorks.step1Title}</h3>
                <p className="text-muted text-lg leading-relaxed">{t.howItWorks.step1Text}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-[120px_1fr] gap-6">
              <span className="text-6xl font-serif text-muted/30">02</span>
              <div>
                <h3 className="text-2xl mb-4">{t.howItWorks.step2Title}</h3>
                <p className="text-muted text-lg leading-relaxed">{t.howItWorks.step2Text}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-[120px_1fr] gap-6">
              <span className="text-6xl font-serif text-muted/30">03</span>
              <div>
                <h3 className="text-2xl mb-4">{t.howItWorks.step3Title}</h3>
                <p className="text-muted text-lg leading-relaxed">{t.howItWorks.step3Text}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Example preview */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-ink text-cream">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted text-lg mb-4">{t.demo.label}</p>
          <h2 className="text-3xl md:text-4xl font-serif mb-8">{t.demo.title}</h2>
          <div className="aspect-video bg-[#0a0a0f] rounded-lg overflow-hidden mb-8 border border-cream/10">
            <iframe
              src={demoUrl}
              className="w-full h-full pointer-events-none"
              title="Demo preview"
            />
          </div>
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-cream px-8 py-4 text-lg hover:bg-cream hover:text-ink transition-colors"
          >
            {t.demo.cta}
          </a>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 md:px-12 lg:px-24 border-t border-ink/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-8">{t.pricing.title}</h2>
          <div className="inline-block border border-ink p-12">
            <p className="text-6xl font-serif mb-4">{t.pricing.price}</p>
            <p className="text-muted text-lg mb-6">{t.pricing.perStory}</p>
            <ul className="text-left text-lg space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-muted">—</span>
                <span>{t.pricing.feature1}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-muted">—</span>
                <span>{t.pricing.feature2}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-muted">—</span>
                <span>{t.pricing.feature3}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-muted">—</span>
                <span>{t.pricing.feature4}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="start" className="py-24 px-6 md:px-12 lg:px-24 bg-ink text-cream">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif mb-4 text-center">{t.form.title}</h2>
          <p className="text-cream/60 text-lg text-center mb-12">{t.form.subtitle}</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && <p className="text-red-400 text-center">{error}</p>}
            <div>
              <label htmlFor="email" className="block text-sm uppercase tracking-wider mb-2 text-cream/60">
                {t.form.emailLabel}
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent border-b border-cream/30 py-3 text-lg focus:outline-none focus:border-cream transition-colors"
                placeholder={t.form.emailPlaceholder}
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm uppercase tracking-wider mb-2 text-cream/60">
                {t.form.titleLabel}
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-transparent border-b border-cream/30 py-3 text-lg focus:outline-none focus:border-cream transition-colors"
                placeholder={t.form.titlePlaceholder}
              />
            </div>

            <div>
              <label htmlFor="story" className="block text-sm uppercase tracking-wider mb-2 text-cream/60">
                {t.form.storyLabel}
              </label>
              <textarea
                id="story"
                required
                rows={10}
                value={formData.story}
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                className="w-full bg-transparent border border-cream/30 p-4 text-lg focus:outline-none focus:border-cream transition-colors resize-none"
                placeholder={t.form.storyPlaceholder}
              />
              <p className="text-cream/40 text-sm mt-2">{t.form.storyHint}</p>
            </div>

            <div>
              <label htmlFor="style" className="block text-sm uppercase tracking-wider mb-2 text-cream/60">
                {t.form.styleLabel}
              </label>
              <select
                id="style"
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                className="w-full bg-ink border-b border-cream/30 py-3 text-lg focus:outline-none focus:border-cream transition-colors"
              >
                <option value="art-film">{t.form.styleArtFilm}</option>
                <option value="storybook">{t.form.styleStorybook}</option>
                <option value="documentary">{t.form.styleDocumentary}</option>
                <option value="dream-sequence">{t.form.styleDream}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cream text-ink py-4 text-lg font-sans hover:bg-cream/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.form.submitting : t.form.submitButton}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 lg:px-24 border-t border-ink/10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-muted">
          <p className="font-serif text-xl text-ink">DownStream</p>
          <p className="text-sm">
            {t.footer.questions} <a href="mailto:hello@downstream.ink" className="underline">hello@downstream.ink</a>
          </p>
        </div>
      </footer>
    </main>
  )
}
