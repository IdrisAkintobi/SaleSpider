import { cn } from "@/lib/utils";
import { useMemo, useRef, useState } from "react";

interface VirtualTableProps<T> {
  readonly data: T[];
  readonly itemHeight: number;
  readonly containerHeight: number;
  readonly renderItem: (item: T, index: number) => React.ReactNode;
  readonly className?: string;
  readonly overscan?: number;
}

export function VirtualTable<T>({
  data,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
}: VirtualTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    );
    const endIndex = Math.min(
      data.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return {
      startIndex,
      endIndex,
      items: data.slice(startIndex, endIndex + 1),
    };
  }, [data, scrollTop, itemHeight, containerHeight, overscan]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const totalHeight = data.length * itemHeight;
  const offsetY = visibleItems.startIndex * itemHeight;

  return (
    <div
      ref={scrollElementRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.items.map((item, index) =>
            renderItem(item, visibleItems.startIndex + index)
          )}
        </div>
      </div>
    </div>
  );
}
