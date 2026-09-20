const primitive = {
  color: {
    brand: { 50: '#F5EEEA', 500: '#7A6254', 600: '#6F584C', 700: '#5F4A40' },
    neutral: {
      0: '#FFFFFF',
      50: '#FAF8F6',
      100: '#F4F0EC',
      200: '#E6DED8',
      400: '#948981',
      500: '#786F69',
      600: '#655D58',
      800: '#403A37',
      950: '#292522',
    },
    accent: { 500: '#B68473' },
  },
  status: {
    success: { bg: '#F2F6F2', fg: '#4F6B57', strong: '#405947' },
    warning: { bg: '#FBF5EE', fg: '#8A5E34', strong: '#714A28' },
    danger: { bg: '#FBF1F1', fg: '#A44E4E', strong: '#893C3C' },
    info: { bg: '#F1F5F7', fg: '#536A78', strong: '#455965' },
  },
} as const;

const semanticColor = {
  bg: {
    canvas: primitive.color.neutral[50],
    surface: primitive.color.neutral[0],
    subtle: primitive.color.neutral[100],
    transparent: 'transparent',
  },
  text: {
    primary: primitive.color.neutral[950],
    secondary: primitive.color.neutral[600],
    muted: primitive.color.neutral[500],
    brand: primitive.color.brand[700],
    inverse: primitive.color.neutral[0],
  },
  border: {
    default: primitive.color.neutral[400],
    subtle: primitive.color.neutral[200],
    strong: primitive.color.neutral[500],
  },
  focus: { ring: primitive.color.brand[500] },
  state: {
    disabled: {
      bg: primitive.color.neutral[100],
      fg: primitive.color.neutral[500],
      border: primitive.color.neutral[200],
      icon: primitive.color.neutral[500],
    },
  },
  status: primitive.status,
  action: {
    primary: {
      bg: primitive.color.brand[500],
      bgHover: primitive.color.brand[600],
      bgActive: primitive.color.brand[700],
      fg: primitive.color.neutral[0],
    },
    secondary: {
      bg: primitive.color.neutral[0],
      bgHover: primitive.color.neutral[50],
      bgActive: primitive.color.neutral[100],
      fg: primitive.color.neutral[950],
      border: primitive.color.neutral[400],
      borderHover: primitive.color.neutral[500],
    },
    ghost: {
      bg: 'transparent',
      bgHover: primitive.color.neutral[50],
      bgActive: primitive.color.neutral[100],
      fg: primitive.color.brand[700],
    },
    destructive: {
      bg: primitive.status.danger.fg,
      bgHover: primitive.status.danger.strong,
      bgActive: primitive.status.danger.strong,
      fg: primitive.color.neutral[0],
    },
  },
} as const;

export const designTokens = {
  primitive,
  color: semanticColor,
  font: {
    family: {
      editorial: '"Cormorant Garamond", Georgia, serif',
      ui: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    weight: { regular: 400, medium: 500, semibold: 600 },
  },
  type: {
    display: {
      family: 'editorial',
      weight: 500,
      letterSpacing: '-0.020em',
      mobile: { size: '44px', lineHeight: '48px' },
      md: { size: '56px', lineHeight: '60px' },
      lg: { size: '64px', lineHeight: '68px' },
    },
    h1: {
      family: 'editorial', weight: 500, letterSpacing: '-0.015em',
      mobile: { size: '36px', lineHeight: '40px' }, md: { size: '44px', lineHeight: '48px' }, lg: { size: '52px', lineHeight: '56px' },
    },
    h2: {
      family: 'editorial', weight: 500, letterSpacing: '-0.010em',
      mobile: { size: '32px', lineHeight: '36px' }, md: { size: '38px', lineHeight: '42px' }, lg: { size: '44px', lineHeight: '48px' },
    },
    h3: {
      family: 'editorial', weight: 500, letterSpacing: '-0.005em',
      mobile: { size: '28px', lineHeight: '32px' }, md: { size: '30px', lineHeight: '34px' }, lg: { size: '34px', lineHeight: '38px' },
    },
    h4: {
      family: 'editorial', weight: 600, letterSpacing: '0',
      mobile: { size: '24px', lineHeight: '28px' }, md: { size: '26px', lineHeight: '30px' }, lg: { size: '28px', lineHeight: '32px' },
    },
    bodyLg: { family: 'ui', size: '18px', lineHeight: '28px', weight: 400, letterSpacing: '0' },
    bodyMd: { family: 'ui', size: '16px', lineHeight: '24px', weight: 400, letterSpacing: '0' },
    bodySm: { family: 'ui', size: '14px', lineHeight: '20px', weight: 400, letterSpacing: '0' },
    caption: { family: 'ui', size: '12px', lineHeight: '16px', weight: 400, letterSpacing: '0.010em' },
    label: { family: 'ui', size: '14px', lineHeight: '20px', weight: 600, letterSpacing: '0.005em' },
    button: { family: 'ui', size: '15px', lineHeight: '20px', weight: 600, letterSpacing: '0.005em' },
    input: { family: 'ui', size: '16px', lineHeight: '24px', weight: 400, letterSpacing: '0' },
  },
  space: { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 6: '24px', 8: '32px', 10: '40px', 12: '48px', 16: '64px', 20: '80px', 24: '96px', 30: '120px' },
  radius: { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '24px', full: '9999px' },
  shadow: {
    none: 'none',
    sm: '0 1px 2px rgb(41 37 34 / 6%)',
    md: '0 8px 24px rgb(41 37 34 / 8%)',
    overlay: '0 20px 50px rgb(41 37 34 / 14%)',
  },
  focus: { ring: { width: '2px', offset: '2px' } },
  icon: { size: { sm: '16px', md: '20px', lg: '24px' }, strokeWidth: 2 },
  control: { height: { compact: '44px', default: '48px' } },
  container: {
    max: '1320px',
    padding: { mobile: '16px', md: '24px', lg: '32px', xl: '48px' },
  },
  grid: {
    columns: { mobile: 4, md: 8, lg: 12 },
    gutter: { mobile: '16px', md: '24px', lg: '24px' },
  },
  breakpoint: { md: '768px', lg: '1024px', xl: '1440px' },
  motion: { fast: '120ms', normal: '160ms', spinner: '800ms', skeleton: '1200ms' },
  layer: { base: 0, navigation: 100, sticky: 300, overlay: 500, modal: 700 },
  component: {
    button: {
      radius: '8px',
      paddingInline: { default: '20px', compact: '16px' },
      iconSize: '20px',
      iconGap: '8px',
    },
    iconButton: { size: { default: '44px', large: '48px' }, iconSize: '20px', radius: '8px' },
    input: { height: '48px', paddingInline: '16px', radius: '8px', iconSize: '20px' },
    divider: { thickness: '1px' },
    spinner: { size: { xs: '16px', sm: '20px', md: '24px', lg: '32px' }, stroke: '2px' },
    navigationLink: {
      minHeight: '44px',
      navigation: { paddingInline: '12px' },
      current: { indicatorWidth: '1px', indicatorOffset: '4px' },
    },
    breadcrumb: { minHeight: '44px', separatorSize: '16px', itemGap: '8px' },
  },
} as const;

export type DesignTokens = typeof designTokens;
