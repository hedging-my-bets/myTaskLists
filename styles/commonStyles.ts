
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// PetProgress Color Palette - Purple/Lavender/Thistle theme
export const colors = {
  // Light mode
  light: {
    background: '#F8F7FC',
    card: '#FFFFFF',
    text: '#2D2D3A',
    textSecondary: '#6B6B7B',
    primary: '#8B7FD6',
    primaryDark: '#6B5FC7',
    secondary: '#C8B8E8',
    accent: '#E8DCFF',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    border: '#E5E5EA',
    shadow: 'rgba(139, 127, 214, 0.15)',
  },
  // Dark mode
  dark: {
    background: '#1A1A24',
    card: '#2D2D3A',
    text: '#F8F7FC',
    textSecondary: '#A8A8B8',
    primary: '#A89FE8',
    primaryDark: '#8B7FD6',
    secondary: '#6B5FC7',
    accent: '#4A3F7F',
    success: '#66BB6A',
    warning: '#FFA726',
    error: '#EF5350',
    border: '#3A3A4A',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
