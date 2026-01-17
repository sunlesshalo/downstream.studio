'use client'

import React from 'react'

export interface PromoEventProps {
  /** Event title */
  title: string
  /** Event description */
  description: string
  /** Event date */
  date?: string
  /** Event time */
  time?: string
  /** Venue/location */
  venue?: string
  /** Ticket price or entry fee */
  price?: string | number
  /** CTA button text */
  ctaText?: string
  /** CTA link */
  ctaHref?: string
  /** Event type for styling */
  type?: 'party' | 'concert' | 'exhibition' | 'launch' | 'festival' | 'workshop'
  /** Key highlights/features */
  highlights?: string[]
  /** Custom className */
  className?: string
}

/**
 * Promotional event component for party/event streams.
 * Use inside the `custom` field of SectionContent.
 *
 * @example
 * sections: [{
 *   id: 'summer-party',
 *   segments: [1],
 *   content: {
 *     custom: <PromoEvent
 *       title="Summer Rooftop Party"
 *       description="Join us for an unforgettable night under the stars..."
 *       date="July 15, 2026"
 *       time="9PM - 4AM"
 *       venue="Sky Lounge, Downtown"
 *       price="$25"
 *       ctaText="Get Tickets"
 *       ctaHref="https://tickets.example.com"
 *       type="party"
 *       highlights={['Live DJ', 'Open Bar 9-11PM', 'Rooftop Views']}
 *     />
 *   }
 * }]
 */
export function PromoEvent({
  title,
  description,
  date,
  time,
  venue,
  price,
  ctaText = 'Learn More',
  ctaHref,
  type,
  highlights = [],
  className = ''
}: PromoEventProps) {
  const formattedPrice = typeof price === 'number' ? `$${price}` : price

  return (
    <div className={`ds-promo-event ${className}`}>
      <style jsx>{`
        .ds-promo-event {
          padding: 1rem 0;
        }

        .ds-promo-event__type {
          display: inline-block;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--ds-color-accent, #d4a056);
          margin-bottom: 0.75rem;
          padding: 0.3rem 0.8rem;
          border: 1px solid var(--ds-color-accent, #d4a056);
          border-radius: 2px;
        }

        .ds-promo-event__title {
          font-family: var(--ds-font-heading, Georgia, serif);
          font-size: clamp(2rem, 6vw, 4rem);
          font-weight: 700;
          margin: 0 0 1rem 0;
          color: var(--ds-color-text, inherit);
          line-height: 1.1;
        }

        .ds-promo-event__meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          font-size: 1rem;
        }

        .ds-promo-event__meta-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .ds-promo-event__meta-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--ds-color-muted, #888);
        }

        .ds-promo-event__meta-value {
          font-weight: 500;
          color: var(--ds-color-text, inherit);
        }

        .ds-promo-event__description {
          font-size: clamp(1rem, 2.5vw, 1.25rem);
          line-height: 1.7;
          color: var(--ds-color-text, inherit);
          opacity: 0.9;
          margin: 0 0 2rem 0;
        }

        .ds-promo-event__highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .ds-promo-event__highlight {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          color: var(--ds-color-text, inherit);
        }

        .ds-promo-event__highlight::before {
          content: '✦';
          color: var(--ds-color-accent, #d4a056);
          font-size: 0.7rem;
        }

        .ds-promo-event__cta {
          display: inline-block;
          padding: 1rem 2.5rem;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          background: var(--ds-color-accent, #d4a056);
          color: var(--ds-color-background, #000);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .ds-promo-event__cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
        }

        .ds-promo-event__price {
          margin-top: 1rem;
          font-size: 0.9rem;
          color: var(--ds-color-muted, #888);
        }

        .ds-promo-event__price strong {
          color: var(--ds-color-text, inherit);
        }
      `}</style>

      {type && (
        <span className="ds-promo-event__type">{type}</span>
      )}

      <h1 className="ds-promo-event__title">{title}</h1>

      <div className="ds-promo-event__meta">
        {date && (
          <div className="ds-promo-event__meta-item">
            <span className="ds-promo-event__meta-label">Date</span>
            <span className="ds-promo-event__meta-value">{date}</span>
          </div>
        )}
        {time && (
          <div className="ds-promo-event__meta-item">
            <span className="ds-promo-event__meta-label">Time</span>
            <span className="ds-promo-event__meta-value">{time}</span>
          </div>
        )}
        {venue && (
          <div className="ds-promo-event__meta-item">
            <span className="ds-promo-event__meta-label">Venue</span>
            <span className="ds-promo-event__meta-value">{venue}</span>
          </div>
        )}
      </div>

      <p className="ds-promo-event__description">{description}</p>

      {highlights.length > 0 && (
        <div className="ds-promo-event__highlights">
          {highlights.map((highlight, index) => (
            <span key={index} className="ds-promo-event__highlight">
              {highlight}
            </span>
          ))}
        </div>
      )}

      {ctaHref && (
        <a href={ctaHref} className="ds-promo-event__cta">
          {ctaText}
        </a>
      )}

      {formattedPrice && (
        <p className="ds-promo-event__price">
          Entry: <strong>{formattedPrice}</strong>
        </p>
      )}
    </div>
  )
}
