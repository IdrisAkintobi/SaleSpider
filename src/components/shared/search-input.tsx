import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  placeholderKey?: string; // i18n key for placeholder, defaults to 'search'
  placeholder?: string; // Direct placeholder text (overrides placeholderKey)
}

export function SearchInput({
  value,
  onChange,
  isLoading,
  placeholderKey = "search",
  placeholder,
}: Readonly<SearchInputProps>) {
  const t = useTranslation();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-20 pointer-events-none" />
      <Input
        placeholder={placeholder || t(placeholderKey)}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="pl-10 pr-10"
        aria-busy={isLoading}
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 z-20"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
