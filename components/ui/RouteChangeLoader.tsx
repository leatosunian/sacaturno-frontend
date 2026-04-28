"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function RouteChangeLoader() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);
  const prevPathname = useRef(pathname);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  // Show loader when the user clicks an internal link
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      const targetPath = href.split("?")[0].split("#")[0];
      if (href.startsWith("/") && targetPath !== prevPathname.current) {
        clearTimeout(hideTimer.current);
        setFading(false);
        setShow(true);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Fade out and hide when navigation completes (pathname changed)
  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;
    setFading(true);
    hideTimer.current = setTimeout(() => {
      setShow(false);
      setFading(false);
    }, 250);
    return () => clearTimeout(hideTimer.current);
  }, [pathname]);

  if (!show) return null;

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
