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
