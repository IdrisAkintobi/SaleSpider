"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, Palette } from "lucide-react";
import { useState } from "react";

interface ColorPickerProps {
  readonly value: string;
  readonly onChange: (color: string) => void;
  readonly label?: string;
  readonly className?: string;
  readonly id?: string;
}

const PRESET_COLORS = [
  "#0f172a",
  "#1e293b",
  "#334155",
  "#475569",
  "#64748b", // Grays
  "#3b82f6",
  "#1d4ed8",
  "#1e40af",
  "#1e3a8a",
  "#172554", // Blues
  "#10b981",
  "#059669",
  "#047857",
  "#065f46",
  "#064e3b", // Greens
  "#f59e0b",
  "#d97706",
  "#b45309",
  "#92400e",
  "#78350f", // Ambers
  "#ef4444",
  "#dc2626",
  "#b91c1c",
  "#991b1b",
  "#7f1d1d", // Reds
  "#8b5cf6",
  "#7c3aed",
  "#6d28d9",
  "#5b21b6",
  "#4c1d95", // Purples
  "#ec4899",
  "#db2777",
  "#be185d",
  "#9d174d",
  "#831843", // Pinks
  "#f97316",
  "#ea580c",
  "#c2410c",
  "#9a3412",
  "#7c2d12", // Oranges
];

export function ColorPicker({
  value,
  onChange,
  label,
  className,
  id,
}: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Validate hex color format
    if (/^#[0-9A-F]{6}$/i.test(newValue)) {
      onChange(newValue);
    }
  };

  const handlePresetClick = (color: string) => {
    setInputValue(color);
    onChange(color);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="flex gap-2">
        <Input
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          placeholder="#000000"
          className="flex-1"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 p-0"
              style={{ backgroundColor: value }}
            >
              <Palette className="h-4 w-4 text-white" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-3">
              <div className="grid grid-cols-8 gap-1">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => handlePresetClick(color)}
                    className={cn(
                      "w-8 h-8 rounded border-2 transition-all hover:scale-110",
                      value === color ? "border-foreground" : "border-border"
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {value === color && (
                      <Check className="w-4 h-4 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={value}
                  onChange={e => {
                    setInputValue(e.target.value);
                    onChange(e.target.value);
                  }}
                  className="w-12 h-8 p-1"
                />
                <span className="text-sm text-muted-foreground">
                  Custom color
                </span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <div
          className="w-10 h-10 rounded border"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  );
}
