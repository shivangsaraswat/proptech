import { useEffect, useState } from "react";
import { BREAKPOINTS } from "../lib/constants";

/**
 * Hook for responsive design based on media queries
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

/**
 * Predefined breakpoint hooks
 */
export function useIsMobile() {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.tablet - 1}px)`);
}

export function useIsTablet() {
  return useMediaQuery(
    `(min-width: ${BREAKPOINTS.tablet}px) and (max-width: ${BREAKPOINTS.desktop - 1}px)`
  );
}

export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.desktop}px)`);
}
