import { Activity } from "lucide-react";
import Link from "next/link";

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
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="p-1.5 bg-primary rounded-lg">
        <Activity size={iconSize} className="text-primary-foreground" />
      </div>
      {showText && (
        <span className={`font-bold ${textSize} text-foreground`}>
          SaleSpider
        </span>
      )}
    </Link>
  );
}
