"use client";
import { useNavigationLoading } from "@/app/context/navigationLoadingContext";
import { useEffect } from "react";

// Signals navigation state to NavigationLoadingContext.
// RouteChangeLoader handles the single visual — this renders nothing.
export default function Loading() {
  const { onServerLoadingStart, onServerLoadingEnd } = useNavigationLoading();

  useEffect(() => {
    onServerLoadingStart();
    return () => {
      onServerLoadingEnd();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
