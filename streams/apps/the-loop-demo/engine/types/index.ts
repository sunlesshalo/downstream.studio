import { ReactNode } from 'react'

/**
 * Main configuration for a stream
 */
export interface StreamConfig {
  /** Unique identifier for the stream */
  id: string
  /** Display title */
  title: string
  /** Type determines default behaviors and styling */
  type: 'story' | 'marketing' | 'presentation'
  /** Animation segments with frame sequences */
  segments: Segment[]
  /** Content sections that map to segments */
  sections: Section[]
  /** Visual theming */
  theme: ThemeConfig
  /** Navigation controls (primarily for presentations) */
  navigation?: NavigationConfig
}

/**
 * Animation segment - a sequence of frames
 */
export interface Segment {
  /** Unique identifier (used in frame path) */
  id: number
  /** Number of frames in this segment */
  frameCount: number
  /** Custom frame path pattern. Defaults to /frames/{id}/frame_{n}.webp */
  framePath?: string
}

/**
 * Content section that displays during specific animation segments
 */
export interface Section {
  /** Unique identifier */
  id: string
  /** Which segment IDs play during this section */
  segments: number[]
  /** How content and animation are arranged */
  layout: LayoutType
  /** The content to display */
  content: SectionContent
  /** Optional background configuration */
  background?: BackgroundConfig
}

/**
 * Layout types for arranging animation and content
 */
export type LayoutType =
  | 'side-by-side'         // Animation left (60%), text right (40%) - story default
  | 'side-by-side-reverse' // Text left (40%), animation right (60%)
  | 'full-bleed'           // Animation fullscreen, text overlay
  | 'centered'             // Centered content over animation
  | 'text-only'            // No animation, just content
  | 'animation-only'       // No content, just animation

/**
 * Structured content for a section
 */
export interface SectionContent {
  /** Main heading */
  heading?: string
  /** Secondary heading */
  subheading?: string
  /** Body content - can be string or React nodes */
  body?: ReactNode
  /** Call-to-action button */
  cta?: CallToAction
  /** Fully custom content (overrides other fields) */
  custom?: ReactNode
}

/**
 * Call-to-action button configuration
 */
export interface CallToAction {
  /** Button text */
  label: string
  /** Link URL (for anchor behavior) */
  href?: string
  /** Click handler (for custom behavior) */
  onClick?: () => void
  /** Visual style */
  variant: 'primary' | 'secondary' | 'ghost'
}

/**
 * Background configuration for sections
 */
export interface BackgroundConfig {
  /** Background type */
  type: 'animation' | 'color' | 'gradient' | 'image'
  /** For color type */
  color?: string
  /** For gradient type */
  gradient?: string
  /** For image type */
  imageUrl?: string
  /** Overlay opacity (0-1) for text readability */
  overlay?: number
}

/**
 * Navigation controls configuration
 */
export interface NavigationConfig {
  /** Enable navigation UI */
  enabled: boolean
  /** Visual style of navigation */
  style: 'dots' | 'arrows' | 'progress-bar' | 'chapters'
  /** Enable keyboard navigation (arrows, spacebar) */
  keyboard: boolean
  /** Position of navigation UI */
  position?: 'bottom' | 'side' | 'top'
}

/**
 * Theme configuration for visual styling
 */
export interface ThemeConfig {
  colors: {
    /** Main background color */
    background: string
    /** Primary text color */
    text: string
    /** Accent color for CTAs, highlights */
    accent: string
    /** Muted text color for secondary content */
    muted: string
  }
  fonts: {
    /** Font family for headings */
    heading: string
    /** Font family for body text */
    body: string
  }
  /** Layout configuration */
  layout?: LayoutConfig
  /** Optional custom CSS variables */
  customVars?: Record<string, string>
}

/**
 * Layout configuration for responsive behavior
 */
export interface LayoutConfig {
  /** Breakpoint for mobile/desktop switch (default: '768px') */
  breakpoint?: string
  /** Desktop animation width percentage (default: 55) */
  desktopAnimationWidth?: number
  /** Mobile animation height (default: '45vh') */
  mobileAnimationHeight?: string
  /** Content max-width for readability (default: '540px') */
  contentMaxWidth?: string
  /** Desktop section padding (default: '60px 48px') */
  desktopSectionPadding?: string
  /** Mobile section padding (default: '32px 24px') */
  mobileSectionPadding?: string
  /** How animation fills its container (default: 'cover') */
  animationFit?: 'cover' | 'contain'
  /** Show blur/fade gradient at animation edge (default: true) */
  edgeFade?: boolean
  /** Width of the edge fade gradient in pixels (default: 80) */
  edgeFadeWidth?: number
}

// ============================================
// Internal types used by engine components
// ============================================

/**
 * Frame reference for the renderer
 */
export interface FrameRef {
  segmentId: number
  frameNumber: number
  src: string
}

/**
 * Active section state
 */
export interface ActiveSectionState {
  sectionId: string
  sectionIndex: number
  segments: number[]
  progress: number // 0-1 progress through section
}

/**
 * Engine state passed to components
 */
export interface EngineState {
  config: StreamConfig
  activeSection: ActiveSectionState | null
  currentFrame: number
  totalFrames: number
  isLoading: boolean
  loadProgress: number // 0-1
}

// ============================================
// Future types (placeholders for extensibility)
// ============================================

/**
 * Interactive hotspot (future)
 */
export interface Hotspot {
  id: string
  x: number // percentage
  y: number // percentage
  content: ReactNode
  trigger: 'hover' | 'click'
}

/**
 * Branching choice (future)
 */
export interface Choice {
  id: string
  label: string
  nextSectionId: string
}
