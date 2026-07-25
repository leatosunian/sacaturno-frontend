"use client";
import { createContext, useContext, useCallback, useRef, useState } from "react";

type NavigationLoadingContextType = {
  isNavigating: boolean;
  pendingPath: string | null;
  onLinkClick: (path?: string) => void;
  onServerLoadingStart: () => void;
  onServerLoadingEnd: () => void;
  onPathnameChange: () => void;
};

const NavigationLoadingContext = createContext<NavigationLoadingContextType>({
  isNavigating: false,
  pendingPath: null,
  onLinkClick: () => {},
  onServerLoadingStart: () => {},
  onServerLoadingEnd: () => {},
  onPathnameChange: () => {},
});

export function NavigationLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const serverLoadingActive = useRef(false);
  const fastNavTimer = useRef<ReturnType<typeof setTimeout>>();
  const serverLoadingEndTimer = useRef<ReturnType<typeof setTimeout>>();

  const onLinkClick = useCallback((path?: string) => {
    clearTimeout(fastNavTimer.current);
    if (path) setPendingPath(path);
    setIsNavigating(true);
  }, []);

  const onServerLoadingStart = useCallback(() => {
    // loading.tsx mounted — cancel both fallback timers so a pending
    // Strict-Mode-cleanup end-signal cannot fire after the remount.
    serverLoadingActive.current = true;
    clearTimeout(fastNavTimer.current);
    clearTimeout(serverLoadingEndTimer.current);
  }, []);

  const onServerLoadingEnd = useCallback(() => {
    // Defer by one macrotask so that React 18 Strict Mode's synchronous
    // cleanup→remount cycle can cancel this via onServerLoadingStart before
    // it fires. On a real unmount no remount follows, so the check runs.
    serverLoadingActive.current = false;
    clearTimeout(serverLoadingEndTimer.current);
    serverLoadingEndTimer.current = setTimeout(() => {
      if (!serverLoadingActive.current) {
        setIsNavigating(false);
        setPendingPath(null);
      }
    }, 0);
  }, []);

  const onPathnameChange = useCallback(() => {
    // Pathname updated optimistically; give React one tick to mount loading.tsx.
    // If loading.tsx doesn't mount, the nav was instant — hide the loader.
    fastNavTimer.current = setTimeout(() => {
      if (!serverLoadingActive.current) {
        setIsNavigating(false);
        setPendingPath(null);
      }
    }, 50);
  }, []);

  return (
    <NavigationLoadingContext.Provider
      value={{ isNavigating, pendingPath, onLinkClick, onServerLoadingStart, onServerLoadingEnd, onPathnameChange }}
    >
      {children}
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading() {
  return useContext(NavigationLoadingContext);
}
