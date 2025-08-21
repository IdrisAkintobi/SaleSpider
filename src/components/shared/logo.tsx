"use client";

import { Activity } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
  const { settings } = useSettingsContext();
  const appName: string = settings?.appName ?? DEFAULT_SETTINGS.appName;
  const appLogo: string = settings?.appLogo ?? DEFAULT_SETTINGS.appLogo;

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      {appLogo ? (
        <Image
          src={appLogo}
          alt={appName}
          width={Math.round(iconSize * 1.2) || 34}
          height={iconSize}
          className="h-8 w-auto"
          style={{ maxHeight: iconSize }}
          priority
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
