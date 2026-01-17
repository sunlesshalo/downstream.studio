'use client'

import React from 'react'

export interface MenuItemProps {
  /** Dish name */
  name: string
  /** Description of the dish */
  description: string
  /** Price (can be number or formatted string like "$28" or "28 €") */
  price: string | number
  /** Category for styling/grouping */
  category?: 'appetizer' | 'main' | 'dessert' | 'drink' | 'side'
  /** Dietary tags */
  dietary?: ('vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'spicy')[]
  /** Allergen warnings */
  allergens?: string[]
  /** Featured/signature dish */
  featured?: boolean
  /** Optional chef's note */
  chefNote?: string
  /** Custom className */
  className?: string
}

/**
 * Menu item component for restaurant menu streams.
 * Use inside the `custom` field of SectionContent.
 *
 * @example
 * sections: [{
 *   id: 'coq-au-vin',
 *   segments: [1],
 *   content: {
 *     custom: <MenuItem
 *       name="Coq au Vin"
 *       description="Burgundy wine-braised chicken with pearl onions..."
 *       price="$28"
 *       category="main"
 *       dietary={['gluten-free']}
 *     />
 *   }
 * }]
 */
export function MenuItem({
  name,
  description,
  price,
  category,
  dietary = [],
  allergens = [],
  featured = false,
  chefNote,
  className = ''
}: MenuItemProps) {
  const formattedPrice = typeof price === 'number' ? `$${price}` : price

  return (
    <div className={`ds-menu-item ${featured ? 'ds-menu-item--featured' : ''} ${className}`}>
      <style jsx>{`
        .ds-menu-item {
          padding: 1rem 0;
        }

        .ds-menu-item--featured {
          position: relative;
        }

        .ds-menu-item--featured::before {
          content: '★';
          position: absolute;
          top: 1rem;
          right: 0;
          color: var(--ds-color-accent, #d4a056);
          font-size: 1.2rem;
        }

        .ds-menu-item__header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .ds-menu-item__name {
          font-family: var(--ds-font-heading, Georgia, serif);
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: 600;
          margin: 0;
          color: var(--ds-color-text, inherit);
          line-height: 1.2;
        }

        .ds-menu-item__price {
          font-family: var(--ds-font-heading, Georgia, serif);
          font-size: clamp(1.2rem, 3vw, 1.8rem);
          font-weight: 500;
          color: var(--ds-color-accent, #d4a056);
          white-space: nowrap;
        }

        .ds-menu-item__category {
          display: inline-block;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--ds-color-muted, #888);
          margin-bottom: 0.75rem;
        }

        .ds-menu-item__description {
          font-size: clamp(1rem, 2vw, 1.15rem);
          line-height: 1.6;
          color: var(--ds-color-text, inherit);
          opacity: 0.9;
          margin: 0 0 1rem 0;
        }

        .ds-menu-item__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .ds-menu-item__tag {
          display: inline-block;
          padding: 0.25rem 0.6rem;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: 3px;
          background: var(--ds-color-accent, #d4a056);
          color: var(--ds-color-background, #000);
          opacity: 0.9;
        }

        .ds-menu-item__tag--dietary {
          background: rgba(76, 175, 80, 0.2);
          color: #81c784;
        }

        .ds-menu-item__allergens {
          font-size: 0.8rem;
          color: var(--ds-color-muted, #888);
          font-style: italic;
        }

        .ds-menu-item__chef-note {
          margin-top: 1rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-left: 2px solid var(--ds-color-accent, #d4a056);
          font-size: 0.9rem;
          font-style: italic;
          color: var(--ds-color-muted, #888);
        }

        .ds-menu-item__chef-note::before {
          content: 'Chef\\'s note: ';
          font-weight: 600;
          color: var(--ds-color-text, inherit);
        }
      `}</style>

      {category && (
        <span className="ds-menu-item__category">{category}</span>
      )}

      <div className="ds-menu-item__header">
        <h2 className="ds-menu-item__name">{name}</h2>
        <span className="ds-menu-item__price">{formattedPrice}</span>
      </div>

      <p className="ds-menu-item__description">{description}</p>

      {dietary.length > 0 && (
        <div className="ds-menu-item__tags">
          {dietary.map((tag) => (
            <span key={tag} className="ds-menu-item__tag ds-menu-item__tag--dietary">
              {tag}
            </span>
          ))}
        </div>
      )}

      {allergens.length > 0 && (
        <p className="ds-menu-item__allergens">
          Contains: {allergens.join(', ')}
        </p>
      )}

      {chefNote && (
        <div className="ds-menu-item__chef-note">{chefNote}</div>
      )}
    </div>
  )
}
