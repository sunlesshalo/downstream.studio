// Main component
export { StreamEngine } from './components/StreamEngine'

// Types
export type {
  StreamConfig,
  Segment,
  Section,
  SectionContent,
  CallToAction,
  LayoutType,
  BackgroundConfig,
  NavigationConfig,
  ThemeConfig,
  FrameRef,
  ActiveSectionState,
  EngineState,
  Hotspot,
  Choice
} from './types'

// Components (for advanced usage)
export { CanvasRenderer } from './components/CanvasRenderer'
export { ContentRenderer } from './components/ContentRenderer'
export { NavigationControls } from './components/NavigationControls'
export { AmbientAudio } from './components/AmbientAudio'
export type { AmbientAudioProps } from './components/AmbientAudio'

// Templates (for menu, promo, and other stream types)
export { MenuItem, PromoEvent } from './templates'
export type { MenuItemProps, PromoEventProps } from './templates'

// Layouts (for custom implementations)
export {
  SideBySideLayout,
  FullBleedLayout,
  CenteredLayout,
  TextOnlyLayout,
  AnimationOnlyLayout
} from './layouts'

// Hooks (for custom implementations)
export { useFrameLoader } from './hooks/useFrameLoader'
export { useSectionObserver } from './hooks/useSectionObserver'
export { useScrollSync } from './hooks/useScrollSync'
