/**
 * Dynamic styles utility for applying settings-based CSS variables
 */

import { AppSettings } from "@/hooks/use-settings";
import { DEFAULT_SETTINGS } from "./constants";

/**
 * Apply dynamic CSS variables to the document root
 */
export function applyDynamicStyles(settings: AppSettings | null) {
  const root = document.documentElement;
  const currentSettings = settings || DEFAULT_SETTINGS;

  // Apply color scheme
  root.style.setProperty('--primary-color', currentSettings.primaryColor);
  root.style.setProperty('--secondary-color', currentSettings.secondaryColor);
  root.style.setProperty('--accent-color', currentSettings.accentColor);

  // Apply theme
  if (currentSettings.theme === 'auto') {
    // Auto theme - let the system decide
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', currentSettings.theme);
  }

  // Apply custom CSS variables for colors
  root.style.setProperty('--color-primary', currentSettings.primaryColor);
  root.style.setProperty('--color-secondary', currentSettings.secondaryColor);
  root.style.setProperty('--color-accent', currentSettings.accentColor);

  // Generate complementary colors
  const primaryRgb = hexToRgb(currentSettings.primaryColor);
  const secondaryRgb = hexToRgb(currentSettings.secondaryColor);
  const accentRgb = hexToRgb(currentSettings.accentColor);

  if (primaryRgb) {
    root.style.setProperty('--color-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
    root.style.setProperty('--color-primary-light', lightenColor(currentSettings.primaryColor, 20));
    root.style.setProperty('--color-primary-dark', darkenColor(currentSettings.primaryColor, 20));
  }

  if (secondaryRgb) {
    root.style.setProperty('--color-secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
    root.style.setProperty('--color-secondary-light', lightenColor(currentSettings.secondaryColor, 20));
    root.style.setProperty('--color-secondary-dark', darkenColor(currentSettings.secondaryColor, 20));
  }

  if (accentRgb) {
    root.style.setProperty('--color-accent-rgb', `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`);
    root.style.setProperty('--color-accent-light', lightenColor(currentSettings.accentColor, 20));
    root.style.setProperty('--color-accent-dark', darkenColor(currentSettings.accentColor, 20));
  }
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Lighten a color by a percentage
 */
function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.min(255, rgb.r + (255 - rgb.r) * (percent / 100));
  const g = Math.min(255, rgb.g + (255 - rgb.g) * (percent / 100));
  const b = Math.min(255, rgb.b + (255 - rgb.b) * (percent / 100));

  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

/**
 * Darken a color by a percentage
 */
function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.max(0, rgb.r - rgb.r * (percent / 100));
  const g = Math.max(0, rgb.g - rgb.g * (percent / 100));
  const b = Math.max(0, rgb.b - rgb.b * (percent / 100));

  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

/**
 * Hook to apply dynamic styles when settings change
 */
export function useDynamicStyles(settings: AppSettings | null) {
  // Apply styles whenever settings change
  if (typeof window !== 'undefined') {
    applyDynamicStyles(settings);
  }
} 