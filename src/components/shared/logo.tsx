"use client";

import { Activity } from "lucide-react";
import Link from "next/link";
import { useSettingsContext } from "@/contexts/settings-context";
import { DEFAULT_SETTINGS } from "@/lib/constants";

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  showText?: boolean;
}

export function Logo({
  className,
  iconSize = 28,
  textSize = "text-2xl",
  showText = true,
}: Readonly<LogoProps>) {
  let appName: string = DEFAULT_SETTINGS.appName;
  let appLogo: string = DEFAULT_SETTINGS.appLogo;

  try {
    const { settings } = useSettingsContext();
    appName = settings?.appName ?? DEFAULT_SETTINGS.appName;
    appLogo = settings?.appLogo ?? DEFAULT_SETTINGS.appLogo;
  } catch {
    // If context is not available, use defaults
  }

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      {appLogo ? (
        <img 
          src={appLogo} 
          alt={appName}
          className="h-8 w-auto"
          style={{ maxHeight: iconSize }}
        />
      ) : (
        <div className="p-1.5 bg-primary rounded-lg">
          <Activity size={iconSize} className="text-primary-foreground" />
        </div>
      )}
      {showText && (
        <span className={`font-bold ${textSize} text-foreground`}>
          {appName}
        </span>
      )}
    </Link>
  );
}
