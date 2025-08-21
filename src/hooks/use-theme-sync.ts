"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";
import { AppSettings } from "./use-settings";

/**
 * Hook to synchronize app settings theme with next-themes
 */
export function useThemeSync(settings: AppSettings | null) {
  const { setTheme } = useTheme();

  useEffect(() => {
    if (settings?.theme) {
      // Convert settings theme to next-themes format
      const themeValue = settings.theme === "auto" ? "system" : settings.theme;
      setTheme(themeValue);
    }
  }, [settings?.theme, setTheme]);
}
