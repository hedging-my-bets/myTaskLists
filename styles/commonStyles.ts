
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// PetProgress Color Palette - Bright-Trust (Dark)
// This is the official color system that should be used across ALL components and widgets
export const colors = {
  // Primary brand color
  primary: '#60A5FA',
  
  // Light mode (keeping for compatibility)
  light: {
    background: '#F8F7FC',
    card: '#FFFFFF',
    text: '#2D2D3A',
    textSecondary: '#6B6B7B',
    primary: '#60A5FA',
    primaryDark: '#3B82F6',
    secondary: '#22D3EE',
    accent: '#A78BFA',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    border: '#E5E5EA',
    shadow: 'rgba(96, 165, 250, 0.15)',
    reward: '#22C55E',
  },
  // Dark mode - Bright-Trust palette with high contrast
  dark: {
    background: '#0B1220',        // Deep blue-black background
    card: '#121826',              // Elevated surface color
    text: '#FFFFFF',              // Pure white for maximum contrast
    textSecondary: '#A8B1C7',     // Muted blue-gray for secondary text
    primary: '#60A5FA',           // Brand blue
    primaryDark: '#3B82F6',       // Darker brand blue
    secondary: '#22D3EE',         // Cyan accent
    accent: '#A78BFA',            // Purple highlight
    success: '#34D399',           // Green success
    warning: '#FBBF24',           // Amber warning
    error: '#F87171',             // Red error
    border: '#1E293B',            // Subtle border
    shadow: 'rgba(0, 0, 0, 0.5)', // Deep shadow
    reward: '#22C55E',            // Bright green reward
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
  // Predefined text styles
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
  
  // Font sizes (for backward compatibility and flexibility)
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  
  // Font weights (for backward compatibility and flexibility)
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
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
