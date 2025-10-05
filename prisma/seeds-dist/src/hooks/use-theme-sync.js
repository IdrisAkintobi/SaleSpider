"use client";
import { useTheme } from "next-themes";
import { useEffect } from "react";
/**
 * Hook to synchronize app settings theme with next-themes
 */
export function useThemeSync(settings) {
    const { setTheme } = useTheme();
    useEffect(() => {
        if (settings?.theme) {
            // Convert settings theme to next-themes format
            const themeValue = settings.theme === "auto" ? "system" : settings.theme;
            setTheme(themeValue);
        }
    }, [settings?.theme, setTheme]);
}
