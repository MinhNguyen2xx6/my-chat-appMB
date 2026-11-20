export const Theme = {
  colors: {
    // Primary Pastel Blue palette
    primary: '#5BA8F7',
    primaryDark: '#2E7FD9',
    primaryLight: '#9ACBFF',
    primarySoft: '#D6EBFF',
    primaryTint: '#EEF6FF',
    headerBg: '#6EB5FA',
    headerSearchBg: 'rgba(255, 255, 255, 0.28)',

    // Surfaces & Backgrounds
    background: '#F4F8FC',
    surface: '#FFFFFF',
    surfaceAlt: '#F8FBFF',
    chatBackground: '#EAF3FC',

    // Chat bubbles
    bubbleMe: '#D4EAFF',
    bubbleMeBorder: '#B7DCFF',
    bubbleOther: '#FFFFFF',
    bubbleOtherBorder: '#E3EEF9',

    // Borders & Dividers
    border: '#E2EDF8',
    divider: '#EDF3FA',

    // Text
    textPrimary: '#1E2A3A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',

    // Status & Accents
    badgeRed: '#FF4D5E',
    badgeMuted: '#B8C7D9',
    online: '#34C759',
    offline: '#CBD5E1',
    pin: '#F59E0B',
    warning: '#F59E0B',
    danger: '#EF4444',
    dangerSoft: '#FEE2E2',
    success: '#22C55E',
    successSoft: '#DCFCE7',

    // Pastel Avatar Palette
    avatarColors: [
      '#7CC0FA',
      '#84D2C5',
      '#A5B4FC',
      '#F9A8D4',
      '#FCD34D',
      '#93C5FD',
      '#86EFAC',
      '#C4B5FD',
    ],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 999,
  },
  shadow: {
    sm: {
      shadowColor: '#2E7FD9',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    md: {
      shadowColor: '#2E7FD9',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
  },
} as const;

export function getAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % Theme.colors.avatarColors.length;
  return Theme.colors.avatarColors[idx];
}
