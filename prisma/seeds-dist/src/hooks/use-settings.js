import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Fetch settings from API
async function fetchSettings() {
    const response = await fetch("/api/settings");
    if (!response.ok) {
        const status = `${response.status} ${response.statusText}`;
        const bodyText = await response.text();
        let message = "Failed to fetch settings";
        if (bodyText) {
            try {
                const json = JSON.parse(bodyText);
                message = json.error || json.message || message;
            }
            catch {
                message = bodyText;
            }
        }
        throw new Error(`${status}: ${message}`);
    }
    return response.json();
}
// Update settings via API
async function updateSettings(data) {
    const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const status = `${response.status} ${response.statusText}`;
        const bodyText = await response.text();
        let message = "Failed to update settings";
        if (bodyText) {
            try {
                const json = JSON.parse(bodyText);
                message = json.error || json.message || message;
            }
            catch {
                message = bodyText;
            }
        }
        throw new Error(`${status}: ${message}`);
    }
    return response.json();
}
// Hook to fetch settings
export function useSettings() {
    return useQuery({
        queryKey: ["settings"],
        queryFn: fetchSettings,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}
// Hook to update settings
export function useUpdateSettings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateSettings,
        onSuccess: (updatedSettings) => {
            // Update the settings cache
            queryClient.setQueryData(["settings"], updatedSettings);
            // Invalidate and refetch settings to ensure consistency
            queryClient.invalidateQueries({ queryKey: ["settings"] });
        },
        onError: (error) => {
            console.error("Failed to update settings:", error);
        },
    });
}
