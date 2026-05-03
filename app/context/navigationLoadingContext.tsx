"use client";
import { createContext, useContext, useCallback, useRef, useState } from "react";

type NavigationLoadingContextType = {
  isNavigating: boolean;
  onLinkClick: () => void;
  onServerLoadingStart: () => void;
  onServerLoadingEnd: () => void;
  onPathnameChange: () => void;
};

const NavigationLoadingContext = createContext<NavigationLoadingContextType>({
  isNavigating: false,
  onLinkClick: () => {},
  onServerLoadingStart: () => {},
  onServerLoadingEnd: () => {},
  onPathnameChange: () => {},
});

export function NavigationLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const serverLoadingActive = useRef(false);
  const fastNavTimer = useRef<ReturnType<typeof setTimeout>>();

  const onLinkClick = useCallback(() => {
    clearTimeout(fastNavTimer.current);
    setIsNavigating(true);
  }, []);

  const onServerLoadingStart = useCallback(() => {
    // loading.tsx mounted — cancel the fast-nav fallback timer
    serverLoadingActive.current = true;
    clearTimeout(fastNavTimer.current);
  }, []);

  const onServerLoadingEnd = useCallback(() => {
    // loading.tsx unmounted — page is ready
    serverLoadingActive.current = false;
    setIsNavigating(false);
  }, []);

  const onPathnameChange = useCallback(() => {
    // Pathname updated optimistically; give React one tick to mount loading.tsx.
    // If loading.tsx doesn't mount, the nav was instant — hide the loader.
    fastNavTimer.current = setTimeout(() => {
      if (!serverLoadingActive.current) {
        setIsNavigating(false);
      }
    }, 50);
  }, []);

  return (
    <NavigationLoadingContext.Provider
      value={{ isNavigating, onLinkClick, onServerLoadingStart, onServerLoadingEnd, onPathnameChange }}
    >
      {children}
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading() {
  return useContext(NavigationLoadingContext);
}
