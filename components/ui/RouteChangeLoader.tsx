"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useNavigationLoading } from "@/app/context/navigationLoadingContext";

export default function RouteChangeLoader() {
  const pathname = usePathname();
  const { isNavigating, onLinkClick, onPathnameChange } = useNavigationLoading();

  // Admin has its own scoped loader inside SidebarInset
  if (pathname.startsWith("/admin")) return null;
  const prevPathname = useRef(pathname);
  const prevIsNavigating = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  // Show loader on internal link click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      const targetPath = href.split("?")[0].split("#")[0];
      const noLoader = ["/login", "/register"];
      if (href.startsWith("/") && targetPath !== prevPathname.current && !noLoader.includes(targetPath)) {
        clearTimeout(hideTimer.current);
        setFading(false);
        onLinkClick();
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [onLinkClick]);

  // Notify context when pathname changes (optimistic URL update)
  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;
    onPathnameChange();
  }, [pathname, onPathnameChange]);

  // Drive visibility and fade animation based on isNavigating transitions
  useEffect(() => {
    const was = prevIsNavigating.current;
    prevIsNavigating.current = isNavigating;

    if (isNavigating) {
      // Navigation started — show immediately, cancel any in-progress fade
      clearTimeout(hideTimer.current);
      setFading(false);
      setVisible(true);
    } else if (was && !isNavigating) {
      // Navigation finished — fade out, then unmount
      setFading(true);
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        setFading(false);
        setVisible(false);
      }, 250);
    }
  }, [isNavigating]);

  if (!visible) return null;

  return (
    <div
      className="pageLoader"
      style={{
        opacity: fading ? 0 : 1,
        transition: fading ? "opacity 0.25s ease-out" : "none",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <div className="pageLoaderInner">
        <Image
          src="/sacaturno-orange.svg"
          alt="SacaTurno"
          width={180}
          height={45}
          className="pageLoaderLogo"
        />
        <div className="pageLoaderTrack">
          <div className="pageLoaderFill" />
        </div>
      </div>
    </div>
  );
}
