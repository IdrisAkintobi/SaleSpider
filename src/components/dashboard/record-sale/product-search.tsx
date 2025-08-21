"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PackageSearch } from "lucide-react";

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ProductSearch({ value, onChange, disabled, placeholder }: ProductSearchProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Label htmlFor="product-search">Search Products</Label>
      </div>
      <div className="relative">
        <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-20 pointer-events-none" />
        <Input
          id="product-search"
          placeholder={placeholder ?? "Search products"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 mb-2"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
