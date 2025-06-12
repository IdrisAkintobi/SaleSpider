import { Input } from "@/components/ui/input";
import { PackageSearch } from "lucide-react";
import React from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export function SearchInput({ value, onChange, isLoading }: SearchInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isLoading && inputRef.current) {
      // Keep focus during loading
      inputRef.current.focus();
    }
  }, [isLoading]);

  return (
    <div className="mb-4">
      <div className="relative max-w-sm">
        <PackageSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          ref={inputRef}
          placeholder="Search products..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
