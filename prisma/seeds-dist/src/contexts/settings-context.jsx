"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { DEFAULT_SETTINGS, PAYMENT_MODE_VALUES } from "@/lib/constants";
import { applyDynamicStyles } from "@/lib/dynamic-styles";
import { useThemeSync } from "@/hooks/use-theme-sync";
const defaultSettings = {
    id: "",
    appName: process.env.NEXT_PUBLIC_APP_NAME || DEFAULT_SETTINGS.appName,
    appLogo: process.env.NEXT_PUBLIC_APP_LOGO || DEFAULT_SETTINGS.appLogo,
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || DEFAULT_SETTINGS.primaryColor,
    secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR || DEFAULT_SETTINGS.secondaryColor,
    accentColor: process.env.NEXT_PUBLIC_ACCENT_COLOR || DEFAULT_SETTINGS.accentColor,
    currency: process.env.NEXT_PUBLIC_CURRENCY || DEFAULT_SETTINGS.currency,
    currencySymbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || DEFAULT_SETTINGS.currencySymbol,
    vatPercentage: parseFloat(process.env.NEXT_PUBLIC_VAT_PERCENTAGE || DEFAULT_SETTINGS.vatPercentage.toString()),
    timezone: process.env.NEXT_PUBLIC_TIMEZONE || DEFAULT_SETTINGS.timezone,
    dateFormat: process.env.NEXT_PUBLIC_DATE_FORMAT || DEFAULT_SETTINGS.dateFormat,
    timeFormat: process.env.NEXT_PUBLIC_TIME_FORMAT || DEFAULT_SETTINGS.timeFormat,
    language: process.env.NEXT_PUBLIC_LANGUAGE || DEFAULT_SETTINGS.language,
    theme: process.env.NEXT_PUBLIC_THEME || DEFAULT_SETTINGS.theme,
    maintenanceMode: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true" || DEFAULT_SETTINGS.maintenanceMode,
    showDeletedProducts: process.env.NEXT_PUBLIC_SHOW_DELETED_PRODUCTS === "true" || DEFAULT_SETTINGS.showDeletedProducts,
    enabledPaymentMethods: (process.env.NEXT_PUBLIC_ENABLED_PAYMENT_METHODS
        ? process.env.NEXT_PUBLIC_ENABLED_PAYMENT_METHODS
            .split(",")
            .map((s) => s.trim().toUpperCase())
            .filter((v) => PAYMENT_MODE_VALUES.includes(v))
        : [...DEFAULT_SETTINGS.enabledPaymentMethods]),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};
const SettingsContext = createContext({
    settings: defaultSettings,
    isLoading: false,
    error: null,
    isMaintenanceMode: defaultSettings.maintenanceMode,
});
export function SettingsProvider({ children }) {
    const { data: settings, isLoading, error } = useSettings();
    const [currentSettings, setCurrentSettings] = useState(defaultSettings);
    // Sync theme with next-themes
    useThemeSync(settings || defaultSettings);
    useEffect(() => {
        if (settings) {
            setCurrentSettings(settings);
            // Apply dynamic styles when settings change
            applyDynamicStyles(settings);
        }
        else {
            // Apply default styles if no settings are loaded
            applyDynamicStyles(defaultSettings);
        }
    }, [settings]);
    // Apply default styles on mount
    useEffect(() => {
        applyDynamicStyles(defaultSettings);
    }, []);
    const value = {
        settings: currentSettings,
        isLoading,
        error,
        isMaintenanceMode: currentSettings.maintenanceMode,
    };
    return (<SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>);
}
export function useSettingsContext() {
    // Always return the context; a default value is provided at creation
    return useContext(SettingsContext);
}
