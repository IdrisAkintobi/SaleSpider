"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColorPicker } from "@/components/ui/color-picker";
import { useAuth } from "@/contexts/auth-context";
import { useSettingsContext } from "@/contexts/settings-context";
import { useToast } from "@/hooks/use-toast";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useTheme } from "next-themes";
import { 
  DEFAULT_SETTINGS, 
  CURRENCY_OPTIONS, 
  TIMEZONE_OPTIONS, 
  DATE_FORMAT_OPTIONS, 
  TIME_FORMAT_OPTIONS, 
  LANGUAGE_OPTIONS, 
  THEME_OPTIONS,
  PAYMENT_METHODS,
  PAYMENT_MODE_VALUES,
  type PaymentMode,
} from "@/lib/constants";
import { useTranslation } from "@/lib/i18n";
import { applyDynamicStyles } from "@/lib/dynamic-styles";
import { Settings, Palette, Globe, CreditCard, Monitor, Save, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const settingsSchema = z.object({
  appName: z.string().min(1, "Application name is required"),
  appLogo: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
  currency: z.string().min(1, "Currency is required"),
  currencySymbol: z.string().min(1, "Currency symbol is required"),
  vatPercentage: z.number().min(0).max(100),
  timezone: z.string().min(1, "Timezone is required"),
  dateFormat: z.string().min(1, "Date format is required"),
  timeFormat: z.string().min(1, "Time format is required"),
  language: z.string().min(1, "Language is required"),
  theme: z.enum(["light", "dark", "auto"]),
  maintenanceMode: z.boolean(),
  showDeletedProducts: z.boolean(),
  enabledPaymentMethods: z.array(z.enum(PAYMENT_MODE_VALUES)).default([]),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { data: settings, isLoading, error } = useSettings();
  const { settings: currentSettings } = useSettingsContext();
  const updateSettingsMutation = useUpdateSettings();
  const t = useTranslation();
  const { setTheme } = useTheme();

  const getDefaultFormValues = () => ({
    appName: DEFAULT_SETTINGS.appName,
    appLogo: DEFAULT_SETTINGS.appLogo,
    primaryColor: DEFAULT_SETTINGS.primaryColor,
    secondaryColor: DEFAULT_SETTINGS.secondaryColor,
    accentColor: DEFAULT_SETTINGS.accentColor,
    currency: DEFAULT_SETTINGS.currency,
    currencySymbol: DEFAULT_SETTINGS.currencySymbol,
    vatPercentage: DEFAULT_SETTINGS.vatPercentage,
    timezone: DEFAULT_SETTINGS.timezone,
    dateFormat: DEFAULT_SETTINGS.dateFormat,
    timeFormat: DEFAULT_SETTINGS.timeFormat,
    language: DEFAULT_SETTINGS.language,
    theme: DEFAULT_SETTINGS.theme as "light" | "dark" | "auto",
    maintenanceMode: DEFAULT_SETTINGS.maintenanceMode,
    showDeletedProducts: DEFAULT_SETTINGS.showDeletedProducts,
    enabledPaymentMethods: [...DEFAULT_SETTINGS.enabledPaymentMethods],
  });

  const getDefaultSettingsWithMeta = () => ({
    ...DEFAULT_SETTINGS,
    // ensure mutable array type for enabledPaymentMethods
    enabledPaymentMethods: [...DEFAULT_SETTINGS.enabledPaymentMethods] as PaymentMode[],
    id: "",
    createdAt: "",
    updatedAt: "",
  });

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: getDefaultFormValues(),
  });

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        appName: settings.appName,
        appLogo: settings.appLogo || "",
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        accentColor: settings.accentColor,
        currency: settings.currency,
        currencySymbol: settings.currencySymbol,
        vatPercentage: settings.vatPercentage,
        timezone: settings.timezone,
        dateFormat: settings.dateFormat,
        timeFormat: settings.timeFormat,
        language: settings.language,
        theme: settings.theme as "light" | "dark" | "auto",
        maintenanceMode: settings.maintenanceMode,
        showDeletedProducts: settings.showDeletedProducts,
        enabledPaymentMethods: settings.enabledPaymentMethods ?? [...DEFAULT_SETTINGS.enabledPaymentMethods],
      });
    }
  }, [settings, form]);

  // Watch form values for instant preview
  const watchedValues = form.watch();

  // Apply dynamic styles instantly when colors change
  useEffect(() => {
    applyDynamicStyles(currentSettings);
  }, [watchedValues.primaryColor, watchedValues.secondaryColor, watchedValues.accentColor, watchedValues.theme, currentSettings]);

  // Check if user is super admin
  if (!user || user.role !== "SUPER_ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Settings className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">{t("access_denied")}</h2>
        <p className="text-muted-foreground">
          {t("super_admin_only")}
        </p>
        <Button
          onClick={() => router.push("/dashboard/overview")}
          className="mt-4"
        >
          Go to Overview
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">{t("loading_data")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-destructive">Failed to load settings: {error.message}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          {t("retry")}
        </Button>
      </div>
    );
  }

  const onSubmit = (data: SettingsFormData) => {
    updateSettingsMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: t("settings_updated"),
          description: t("settings_saved"),
        });
      },
      onError: (error) => {
        toast({
          title: t("error"),
          description: error.message || t("failed_to_update"),
          variant: "destructive",
        });
      },
    });
  };

  const handleCurrencyChange = (currencyCode: string) => {
    const currency = CURRENCY_OPTIONS.find(c => c.code === currencyCode);
    if (currency) {
      form.setValue("currency", currency.code);
      form.setValue("currencySymbol", currency.symbol);
    }
  };

  const handleReset = () => {
    // Reset to application default settings
    form.reset(getDefaultFormValues());
    
    // Reset theme to default value
    const themeValue = DEFAULT_SETTINGS.theme === "auto" ? "system" : DEFAULT_SETTINGS.theme;
    setTheme(themeValue);
    
    // Apply default dynamic styles
    applyDynamicStyles(getDefaultSettingsWithMeta());
  };

  const handleSectionReset = (section: string) => {
    const defaults = getDefaultFormValues();
    
    switch (section) {
      case 'general':
        form.setValue("appName", defaults.appName);
        form.setValue("appLogo", defaults.appLogo);
        form.setValue("vatPercentage", defaults.vatPercentage);
        break;
      case 'appearance':
        form.setValue("primaryColor", defaults.primaryColor);
        form.setValue("secondaryColor", defaults.secondaryColor);
        form.setValue("accentColor", defaults.accentColor);
        form.setValue("theme", defaults.theme);
        // Reset theme immediately
        const themeValue = DEFAULT_SETTINGS.theme === "auto" ? "system" : DEFAULT_SETTINGS.theme;
        setTheme(themeValue);
        // Apply default colors
        applyDynamicStyles(getDefaultSettingsWithMeta());
        break;
      case 'payments':
        form.setValue("currency", defaults.currency);
        form.setValue("currencySymbol", defaults.currencySymbol);
        form.setValue("enabledPaymentMethods", [...DEFAULT_SETTINGS.enabledPaymentMethods] as PaymentMode[]);
        break;
      case 'localization':
        form.setValue("language", defaults.language);
        form.setValue("timezone", defaults.timezone);
        form.setValue("dateFormat", defaults.dateFormat);
        form.setValue("timeFormat", defaults.timeFormat);
        break;
      case 'system':
        form.setValue("maintenanceMode", defaults.maintenanceMode);
        break;
    }
  };

  return (
    <>
      <PageHeader
        title={t("settings")}
        description={t("settings_page_description")}
      />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">{t("general")}</TabsTrigger>
            <TabsTrigger value="appearance">{t("appearance")}</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="localization">{t("localization")}</TabsTrigger>
            <TabsTrigger value="system">{t("system")}</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    {t("general")} {t("settings")}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSectionReset('general')}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  {t("general_settings_description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="appName">{t("application_name")}</Label>
                  <Input
                    id="appName"
                    {...form.register("appName")}
                    placeholder="Enter application name"
                  />
                  {form.formState.errors.appName && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.appName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appLogo">{t("logo_url")}</Label>
                  <Input
                    id="appLogo"
                    {...form.register("appLogo")}
                    placeholder="https://example.com/logo.png"
                  />
                  {form.formState.errors.appLogo && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.appLogo.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vatPercentage">{t("vat_percentage")}</Label>
                  <Input
                    id="vatPercentage"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    {...form.register("vatPercentage", { valueAsNumber: true })}
                    placeholder="7.5"
                  />
                  {form.formState.errors.vatPercentage && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.vatPercentage.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    {t("appearance")}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSectionReset('appearance')}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  {t("appearance_settings_description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ColorPicker
                    value={watchedValues.primaryColor}
                    onChange={(color) => form.setValue("primaryColor", color)}
                    label={t("primary_color")}
                  />

                  <ColorPicker
                    value={watchedValues.secondaryColor}
                    onChange={(color) => form.setValue("secondaryColor", color)}
                    label={t("secondary_color")}
                  />

                  <ColorPicker
                    value={watchedValues.accentColor}
                    onChange={(color) => form.setValue("accentColor", color)}
                    label={t("accent_color")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">{t("theme")}</Label>
                  <Select
                    value={watchedValues.theme}
                    onValueChange={(value) => {
                      form.setValue("theme", value as "light" | "dark" | "auto");
                      // Apply theme immediately using next-themes
                      const themeValue = value === "auto" ? "system" : value;
                      setTheme(themeValue);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {THEME_OPTIONS.map((theme) => (
                        <SelectItem key={theme.value} value={theme.value}>
                          {t(theme.value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.theme && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.theme.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payments {t("settings")}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSectionReset('payments')}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  {t("currency_settings_description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">{t("currency")}</Label>
                  <Select
                    value={watchedValues.currency}
                    onValueChange={handleCurrencyChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name} ({currency.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.currency && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.currency.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Enabled Payment Methods</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => form.setValue("enabledPaymentMethods", PAYMENT_METHODS.map(m => m.enum))}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => form.setValue("enabledPaymentMethods", [])}
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {PAYMENT_METHODS.map((m) => {
                      const checked = (watchedValues.enabledPaymentMethods || []).includes(m.enum);
                      return (
                        <div key={m.enum} className="flex items-center space-x-2">
                          <Checkbox
                            id={`pm-${m.enum}`}
                            checked={checked}
                            onCheckedChange={(val) => {
                              const current = new Set(watchedValues.enabledPaymentMethods || []);
                              if (val === true) {
                                current.add(m.enum);
                              } else {
                                current.delete(m.enum);
                              }
                              form.setValue("enabledPaymentMethods", Array.from(current) as PaymentMode[]);
                            }}
                          />
                          <Label htmlFor={`pm-${m.enum}`}>{m.label}</Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="localization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    {t("localization")}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSectionReset('localization')}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  {t("localization_settings_description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">{t("language")}</Label>
                  <Select
                    value={watchedValues.language}
                    onValueChange={(value) => form.setValue("language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.language && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.language.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">{t("timezone")}</Label>
                  <Select
                    value={watchedValues.timezone}
                    onValueChange={(value) => form.setValue("timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONE_OPTIONS.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.timezone && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.timezone.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">{t("date_format")}</Label>
                    <Select
                      value={watchedValues.dateFormat}
                      onValueChange={(value) => form.setValue("dateFormat", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        {DATE_FORMAT_OPTIONS.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.dateFormat && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.dateFormat.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeFormat">{t("time_format")}</Label>
                    <Select
                      value={watchedValues.timeFormat}
                      onValueChange={(value) => form.setValue("timeFormat", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time format" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_FORMAT_OPTIONS.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.timeFormat && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.timeFormat.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {t("system")} {t("settings")}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSectionReset('system')}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  {t("system_settings_description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenanceMode">{t("maintenance_mode")}</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="maintenanceMode"
                      checked={watchedValues.maintenanceMode}
                      onCheckedChange={(checked) => form.setValue("maintenanceMode", checked)}
                    />
                    <Label htmlFor="maintenanceMode" className="text-sm text-muted-foreground">
                      {t("maintenance_mode_description")}
                    </Label>
                  </div>
                  {form.formState.errors.maintenanceMode && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.maintenanceMode.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="showDeletedProducts">Show Deleted Products</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showDeletedProducts"
                      checked={watchedValues.showDeletedProducts}
                      onCheckedChange={(checked) => form.setValue("showDeletedProducts", checked)}
                    />
                    <Label htmlFor="showDeletedProducts" className="text-sm text-muted-foreground">
                      Display soft-deleted products in inventory (Super Admin only)
                    </Label>
                  </div>
                  {form.formState.errors.showDeletedProducts && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.showDeletedProducts.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-6 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 pb-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={updateSettingsMutation.isPending}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {t("reset")}
          </Button>
          <Button
            type="submit"
            disabled={updateSettingsMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {updateSettingsMutation.isPending ? t("loading") : t("save")} {t("settings")}
          </Button>
        </div>
      </form>
    </>
  );
} 