import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  placeholderKey?: string; // i18n key for placeholder, defaults to 'search_products'
}

export function SearchInput({ value, onChange, isLoading, placeholderKey = "search_products" }: SearchInputProps) {
  const t = useTranslation();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-20 pointer-events-none" />
      <Input
        placeholder={t(placeholderKey)}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
        aria-busy={isLoading}
      />
    </div>
  );
}
