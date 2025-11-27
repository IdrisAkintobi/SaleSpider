import { useEffect } from "react";

interface UseIntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export function useIntersectionObserver(
  target: Element | null,
  onIntersect: (entry: IntersectionObserverEntry) => void,
  {
    root = null,
    rootMargin = "0px",
    threshold = 0.1,
  }: UseIntersectionObserverOptions = {}
) {
  useEffect(() => {
    if (!target) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) onIntersect(entry);
        });
      },
      { root, rootMargin, threshold }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [target, root, rootMargin, threshold, onIntersect]);
}
