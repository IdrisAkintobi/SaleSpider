/**
 * Performance monitoring hooks for tracking app performance
 */

import { useEffect, useRef, useState } from 'react';

// Hook to measure component render time
export function useRenderTime(componentName: string) {
  const renderStart = useRef<number>(0);
  
  useEffect(() => {
    renderStart.current = performance.now();
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(`⚠️ ${componentName} render took ${renderTime.toFixed(2)}ms (>16ms)`);
    }
  });
}

// Hook to track page load performance
export function usePagePerformance(pageName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 ${pageName} page load: ${loadTime.toFixed(2)}ms`);
      }
    };
  }, [pageName]);
}

// Hook to monitor memory usage
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  useEffect(() => {
    if ('memory' in performance) {
      const updateMemory = () => {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        });
      };

      updateMemory();
      const interval = setInterval(updateMemory, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, []);

  return memoryInfo;
}

// Hook to track API call performance
export function useAPIPerformance() {
  const trackAPICall = (endpoint: string, startTime: number, endTime: number, success: boolean) => {
    const duration = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      const status = success ? '✅' : '❌';
      console.log(`${status} API ${endpoint}: ${duration.toFixed(2)}ms`);
      
      if (duration > 1000) {
        console.warn(`⚠️ Slow API call to ${endpoint}: ${duration.toFixed(2)}ms`);
      }
    }
  };

  return { trackAPICall };
}

// Hook to detect slow renders
export function useSlowRenderDetector(threshold = 16) {
  const renderCount = useRef(0);
  const slowRenders = useRef(0);

  useEffect(() => {
    const start = performance.now();
    renderCount.current++;
    const currentSlowRenders = slowRenders.current;
    const currentRenderCount = renderCount.current;

    return () => {
      const renderTime = performance.now() - start;
      if (renderTime > threshold) {
        const newSlowCount = currentSlowRenders + 1;
        slowRenders.current = newSlowCount;
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `🐌 Slow render detected: ${renderTime.toFixed(2)}ms ` +
            `(${newSlowCount}/${currentRenderCount} renders were slow)`
          );
        }
      }
    };
  });

  useEffect(() => {
    const slowRendersRef = slowRenders.current;
    const renderCountRef = renderCount.current;
    return () => {
      const percentage = renderCountRef > 0
        ? (slowRendersRef / renderCountRef) * 100
        : 0;

      if (percentage > 0) {
        console.log(`Slow render stats: ${percentage.toFixed(1)}% slow renders (${slowRendersRef}/${renderCountRef})`);
      }
    };
  }, []);

  return {
    renderCount: renderCount.current,
    slowRenders: slowRenders.current,
    slowRenderPercentage: renderCount.current > 0 
      ? (slowRenders.current / renderCount.current) * 100 
      : 0,
  };
}
