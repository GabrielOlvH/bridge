import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { palette } from '@/lib/theme';

export function TerminalIcon({ size = 20, color = palette.ink }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth="2" />
      <Path d="M6 9L10 12L6 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 15H18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function ServerIcon({ size = 16, color = palette.muted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="2" width="20" height="8" rx="2" stroke={color} strokeWidth="1.5" />
      <Rect x="2" y="14" width="20" height="8" rx="2" stroke={color} strokeWidth="1.5" />
      <Circle cx="6" cy="6" r="1" fill={color} />
      <Circle cx="6" cy="18" r="1" fill={color} />
    </Svg>
  );
}

export function PlusIcon({ size = 18, color = '#FFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

export function MoreIcon({ size = 16, color = palette.muted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="1.5" fill={color} />
      <Circle cx="12" cy="6" r="1.5" fill={color} />
      <Circle cx="12" cy="18" r="1.5" fill={color} />
    </Svg>
  );
}

export function FolderIcon({ size = 16, color = palette.muted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H12L10 5H5C3.89543 5 3 5.89543 3 7Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PortsIcon({ size = 16, color = palette.muted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
      <Circle cx="12" cy="12" r="3" fill={color} />
      <Path d="M12 3V6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M12 18V21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M3 12H6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M18 12H21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}
