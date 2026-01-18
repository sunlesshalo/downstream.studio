'use client'

import { SectionContent, ThemeConfig } from '../types'

interface ContentRendererProps {
  content: SectionContent
  theme: ThemeConfig
  className?: string
}

/**
 * Renders structured section content (heading, subheading, body, CTA)
 */
export function ContentRenderer({
  content,
  theme,
  className = ''
}: ContentRendererProps) {
  // If custom content is provided, render only that
  if (content.custom) {
    return <div className={`ds-content ${className}`}>{content.custom}</div>
  }

  return (
    <div className={`ds-content ${className}`}>
      <style jsx>{`
        .ds-content {
          color: var(--ds-color-text, ${theme.colors.text});
          font-family: var(--ds-font-body, ${theme.fonts.body});
        }

        .ds-content__heading {
          font-family: var(--ds-font-heading, ${theme.fonts.heading});
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          line-height: 1.1;
          margin: 0 0 0.5em 0;
          color: var(--ds-color-text, ${theme.colors.text});
        }

        .ds-content__subheading {
          font-size: clamp(1.1rem, 2.5vw, 1.5rem);
          font-weight: 400;
          line-height: 1.4;
          margin: 0 0 1.5em 0;
          color: var(--ds-color-muted, ${theme.colors.muted});
        }

        .ds-content__body {
          font-size: clamp(1rem, 2vw, 1.2rem);
          line-height: 1.7;
          margin: 0 0 2em 0;
        }

        .ds-content__body p {
          margin: 0 0 1em 0;
        }

        .ds-content__body p:last-child {
          margin-bottom: 0;
        }

        .ds-content__cta {
          display: inline-block;
          padding: 14px 32px;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          border: none;
        }

        .ds-content__cta:hover {
          transform: translateY(-2px);
        }

        .ds-content__cta--primary {
          background: var(--ds-color-accent, ${theme.colors.accent});
          color: var(--ds-color-background, ${theme.colors.background});
        }

        .ds-content__cta--primary:hover {
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
        }

        .ds-content__cta--secondary {
          background: transparent;
          color: var(--ds-color-text, ${theme.colors.text});
          border: 2px solid var(--ds-color-text, ${theme.colors.text});
        }

        .ds-content__cta--ghost {
          background: transparent;
          color: var(--ds-color-accent, ${theme.colors.accent});
          padding: 14px 16px;
        }

        .ds-content__cta--ghost:hover {
          text-decoration: underline;
          transform: none;
        }
      `}</style>

      {content.heading && (
        <h2 className="ds-content__heading">{content.heading}</h2>
      )}

      {content.subheading && (
        <p className="ds-content__subheading">{content.subheading}</p>
      )}

      {content.body && (
        <div className="ds-content__body">{content.body}</div>
      )}

      {content.cta && (
        <CTAButton cta={content.cta} />
      )}
    </div>
  )
}

/**
 * CTA Button component
 */
function CTAButton({ cta }: { cta: NonNullable<SectionContent['cta']> }) {
  const className = `ds-content__cta ds-content__cta--${cta.variant}`

  if (cta.href) {
    return (
      <a href={cta.href} className={className}>
        {cta.label}
      </a>
    )
  }

  return (
    <button onClick={cta.onClick} className={className}>
      {cta.label}
    </button>
  )
}
