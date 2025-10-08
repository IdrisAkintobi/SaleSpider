/**
 * Dynamic styles utility for applying settings-based CSS variables
 */
import { DEFAULT_SETTINGS } from "./constants";
/**
 * Apply dynamic CSS variables to the document root
 */
export function applyDynamicStyles(settings) {
    // Only run in browser environment
    if (typeof window === 'undefined')
        return;
    const root = document.documentElement;
    const currentSettings = settings || DEFAULT_SETTINGS;
    // Convert hex colors to HSL for Tailwind CSS compatibility
    const primaryHsl = hexToHsl(currentSettings.primaryColor);
    const secondaryHsl = hexToHsl(currentSettings.secondaryColor);
    const accentHsl = hexToHsl(currentSettings.accentColor);
    // Apply Tailwind CSS variables in HSL format
    if (primaryHsl) {
        root.style.setProperty('--primary', `${primaryHsl.h} ${primaryHsl.s}% ${primaryHsl.l}%`);
    }
    if (secondaryHsl) {
        root.style.setProperty('--secondary', `${secondaryHsl.h} ${secondaryHsl.s}% ${secondaryHsl.l}%`);
    }
    if (accentHsl) {
        root.style.setProperty('--accent', `${accentHsl.h} ${accentHsl.s}% ${accentHsl.l}%`);
    }
    // Also keep hex format for direct usage
    root.style.setProperty('--primary-color', currentSettings.primaryColor);
    root.style.setProperty('--secondary-color', currentSettings.secondaryColor);
    root.style.setProperty('--accent-color', currentSettings.accentColor);
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
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
/**
 * Convert hex color to HSL
 */
function hexToHsl(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb)
        return null;
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}
/**
 * Lighten a color by a percentage
 */
function lightenColor(hex, percent) {
    const rgb = hexToRgb(hex);
    if (!rgb)
        return hex;
    const r = Math.min(255, rgb.r + (255 - rgb.r) * (percent / 100));
    const g = Math.min(255, rgb.g + (255 - rgb.g) * (percent / 100));
    const b = Math.min(255, rgb.b + (255 - rgb.b) * (percent / 100));
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}
/**
 * Darken a color by a percentage
 */
function darkenColor(hex, percent) {
    const rgb = hexToRgb(hex);
    if (!rgb)
        return hex;
    const r = Math.max(0, rgb.r - rgb.r * (percent / 100));
    const g = Math.max(0, rgb.g - rgb.g * (percent / 100));
    const b = Math.max(0, rgb.b - rgb.b * (percent / 100));
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}
/**
 * Hook to apply dynamic styles when settings change
 */
export function useDynamicStyles(settings) {
    // Apply styles whenever settings change
    if (typeof window !== 'undefined') {
        applyDynamicStyles(settings);
    }
}
