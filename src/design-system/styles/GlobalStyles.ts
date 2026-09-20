import { createGlobalStyle } from 'styled-components';
import { designTokens as t } from '../tokens/designTokens';

export const GlobalStyles = createGlobalStyle`
  :root {
    --color-bg-canvas: ${t.color.bg.canvas};
    --color-bg-surface: ${t.color.bg.surface};
    --color-bg-subtle: ${t.color.bg.subtle};
    --color-bg-transparent: ${t.color.bg.transparent};
    --color-text-primary: ${t.color.text.primary};
    --color-text-secondary: ${t.color.text.secondary};
    --color-text-muted: ${t.color.text.muted};
    --color-text-brand: ${t.color.text.brand};
    --color-text-inverse: ${t.color.text.inverse};
    --color-border-default: ${t.color.border.default};
    --color-border-subtle: ${t.color.border.subtle};
    --color-border-strong: ${t.color.border.strong};
    --color-focus-ring: ${t.color.focus.ring};
    --color-disabled-bg: ${t.color.state.disabled.bg};
    --color-disabled-fg: ${t.color.state.disabled.fg};
    --color-disabled-border: ${t.color.state.disabled.border};
    --color-action-primary-bg: ${t.color.action.primary.bg};
    --color-action-primary-hover: ${t.color.action.primary.bgHover};
    --color-action-primary-active: ${t.color.action.primary.bgActive};
    --color-action-primary-fg: ${t.color.action.primary.fg};
    --color-action-secondary-bg: ${t.color.action.secondary.bg};
    --color-action-secondary-hover: ${t.color.action.secondary.bgHover};
    --color-action-secondary-active: ${t.color.action.secondary.bgActive};
    --color-action-secondary-fg: ${t.color.action.secondary.fg};
    --color-action-secondary-border: ${t.color.action.secondary.border};
    --color-action-secondary-border-hover: ${t.color.action.secondary.borderHover};
    --color-action-ghost-bg: ${t.color.action.ghost.bg};
    --color-action-ghost-hover: ${t.color.action.ghost.bgHover};
    --color-action-ghost-active: ${t.color.action.ghost.bgActive};
    --color-action-ghost-fg: ${t.color.action.ghost.fg};
    --color-danger-bg: ${t.color.status.danger.bg};
    --color-danger-fg: ${t.color.status.danger.fg};
    --color-danger-strong: ${t.color.status.danger.strong};
    --font-family-ui: ${t.font.family.ui};
    --font-family-editorial: ${t.font.family.editorial};
    --shadow-none: ${t.shadow.none};
    --shadow-sm: ${t.shadow.sm};
    --shadow-md: ${t.shadow.md};
    --shadow-overlay: ${t.shadow.overlay};
    --layer-base: ${t.layer.base};
    --layer-navigation: ${t.layer.navigation};
    --layer-sticky: ${t.layer.sticky};
    --layer-overlay: ${t.layer.overlay};
    --layer-modal: ${t.layer.modal};
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      scroll-behavior: auto !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
