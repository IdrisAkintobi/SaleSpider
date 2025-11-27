import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaymentMode } from "@/lib/constants";
import { fetchJson } from "@/lib/fetch-utils";

export interface AppSettings {
  id: string;
  appName: string;
  appLogo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  currency: string;
  currencySymbol: string;
  vatPercentage: number;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  theme: string;
  maintenanceMode: boolean;
  showDeletedProducts: boolean;
  enabledPaymentMethods: PaymentMode[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsData {
  appName?: string;
  appLogo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  currency?: string;
  currencySymbol?: string;
  vatPercentage?: number;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  language?: string;
  theme?: string;
  maintenanceMode?: boolean;
  showDeletedProducts?: boolean;
  enabledPaymentMethods?: PaymentMode[];
}

// Fetch settings from API
async function fetchSettings(): Promise<AppSettings> {
  return fetchJson<AppSettings>("/api/settings");
}

// Update settings via API
async function updateSettings(data: UpdateSettingsData): Promise<AppSettings> {
  return fetchJson<AppSettings>("/api/settings", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

// Hook to fetch settings
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook to update settings
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSettings,
    onSuccess: updatedSettings => {
      // Update the settings cache
      queryClient.setQueryData(["settings"], updatedSettings);

      // Invalidate and refetch settings to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: error => {
      console.error("Failed to update settings:", error);
    },
  });
}
