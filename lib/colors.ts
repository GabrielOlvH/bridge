import { Platform, PlatformColor } from 'react-native';

export const systemColors = Platform.select({
  ios: {
    background: PlatformColor('systemBackground'),
    secondaryBackground: PlatformColor('secondarySystemBackground'),
    groupedBackground: PlatformColor('systemGroupedBackground'),
    label: PlatformColor('label'),
    secondaryLabel: PlatformColor('secondaryLabel'),
    separator: PlatformColor('separator'),
    // Status
    green: PlatformColor('systemGreen'),
    red: PlatformColor('systemRed'),
    orange: PlatformColor('systemOrange'),
    blue: PlatformColor('systemBlue'),
    teal: PlatformColor('systemTeal'),
    purple: PlatformColor('systemPurple'),
    pink: PlatformColor('systemPink'),
    indigo: PlatformColor('systemIndigo'),
  },
  default: {
    // Android fallback colors
    background: '#FFFFFF',
    secondaryBackground: '#F2F2F7',
    groupedBackground: '#F2F2F7',
    label: '#000000',
    secondaryLabel: '#3C3C43',
    separator: '#C6C6C8',
    green: '#34C759',
    red: '#FF3B30',
    orange: '#FF9500',
    blue: '#007AFF',
    teal: '#5AC8FA',
    purple: '#AF52DE',
    pink: '#FF2D55',
    indigo: '#5856D6',
  },
})!;

// Host accent colors using system colors
export const hostColors = Platform.select({
  ios: [
    PlatformColor('systemBlue'),
    PlatformColor('systemPurple'),
    PlatformColor('systemPink'),
    PlatformColor('systemTeal'),
    PlatformColor('systemOrange'),
    PlatformColor('systemIndigo'),
  ],
  default: [
    '#007AFF',
    '#AF52DE',
    '#FF2D55',
    '#5AC8FA',
    '#FF9500',
    '#5856D6',
  ],
})!;

// Status color mapping
export const statusColors = {
  running: systemColors.green,
  online: systemColors.green,
  stopped: systemColors.red,
  offline: systemColors.red,
  idle: systemColors.orange,
  warning: systemColors.orange,
  info: systemColors.blue,
  accent: systemColors.teal,
};
