"use client";

import React from "react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

export function ShimmerButton({
  children,
  primary = false,
  href,
  className,
}: {
  children: React.ReactNode;
  primary?: boolean;
  href?: string;
  className?: string;
}) {
  const cls = twMerge(
    "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl",
    "text-[14px] font-bold cursor-pointer transition-all duration-[180ms]",
    "hover:opacity-90 hover:-translate-y-px",
    primary
      ? "bg-[#dd4924] text-white border-none px-9 py-[15px]"
      : "bg-white/60 text-[#1a1a1a] border border-black/[0.08] px-7 py-[14px] backdrop-blur-sm hover:bg-white/90",
    className,
  );

  const inner = (
    <>
      {primary && <span className="cta-shimmer-sweep" />}
      {children}
    </>
  );

  if (href) {
    return <Link href={href} className={cls}>{inner}</Link>;
  }
  return <button className={cls}>{inner}</button>;
}
