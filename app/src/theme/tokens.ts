/** Monty design tokens (brief section 13). */
export const colors = {
  background: '#EEF3F0',
  ink: '#23302B',
  muted: '#4A5A52',
  primary: '#2F5D4A',
  onPrimary: '#FFFFFF',
  softGreen: '#E3EEE8',
  progress: '#5E8F77',
  progressTrack: '#D5E3DB',
  card: '#FFFFFF',
  border: '#C5D6CC',
  hollowDot: '#8FA99B',
  leafLight: '#8DB8A0',
  leafDark: '#7FA38F',
  stem: '#6E9B82',
  pot: '#D4B8A2',
  potRim: '#C4A28A',
  face: '#3B2F2A',
  blossom: '#E9A9A0',
  blossomCenter: '#F3D58B',
} as const;

export const radius = {
  card: 16,
  chip: 999,
  button: 999,
  checkbox: 8,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Minimum touch target in dp. */
export const touchTarget = 44;

export const fonts = {
  regular: 'Nunito_400Regular',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
} as const;

export const type = {
  display: { fontFamily: fonts.extraBold, fontSize: 32, lineHeight: 40 },
  title: { fontFamily: fonts.extraBold, fontSize: 28, lineHeight: 36 },
  heading: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 24 },
  secondary: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 },
  small: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.72,
    textTransform: 'uppercase',
  },
  button: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24 },
} as const;

export type TypeVariant = keyof typeof type;
