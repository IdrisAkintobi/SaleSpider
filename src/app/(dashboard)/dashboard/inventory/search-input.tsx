"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export function SearchInput({ value, onChange, isLoading }: SearchInputProps) {
  const t = useTranslation();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-20 pointer-events-none" />
      <Input
        placeholder={t("search_products")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
        disabled={isLoading}
      />
    </div>
  );
}
