"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useNavigationLoading } from "@/app/context/navigationLoadingContext";

export default function AdminRouteChangeLoader() {
  const pathname = usePathname();
  const { isNavigating, onLinkClick, onPathnameChange } = useNavigationLoading();
  const prevPathname = useRef(pathname);
  const prevIsNavigating = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      const targetPath = href.split("?")[0].split("#")[0];
      if (href.startsWith("/admin") && targetPath !== prevPathname.current) {
        clearTimeout(hideTimer.current);
        setFading(false);
        onLinkClick(targetPath);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [onLinkClick]);

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;
    onPathnameChange();
  }, [pathname, onPathnameChange]);

  useEffect(() => {
    const was = prevIsNavigating.current;
    prevIsNavigating.current = isNavigating;

    if (isNavigating) {
      clearTimeout(hideTimer.current);
      setFading(false);
      setVisible(true);
    } else if (was && !isNavigating) {
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
      className="adminContentLoader"
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
          width={160}
          height={40}
          className="pageLoaderLogo"
        />
        <div className="pageLoaderTrack">
          <div className="pageLoaderFill" />
        </div>
      </div>
    </div>
  );
}
