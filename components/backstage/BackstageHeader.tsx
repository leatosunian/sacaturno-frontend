"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import sacaturno_logo from "@/public/sacaturno-orange.svg";
import BackstageLogoutButton from "./BackstageLogoutButton";

const NAV_LINKS = [
  { href: "/backstage", label: "Resumen", exact: true },
  { href: "/backstage/businesses", label: "Negocios" },
  { href: "/backstage/users", label: "Usuarios" },
  { href: "/backstage/pricing", label: "Planes" },
];

const isActive = (pathname: string, href: string, exact?: boolean) =>
  exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

const BackstageHeader = ({ email }: { email: string }) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-black">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-3 px-4 py-3 sm:px-8 2xl:px-14">
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/backstage" className="flex items-center" aria-label="Ir al resumen">
            <Image src={sacaturno_logo} alt="Sacaturno" className="h-6 w-auto" priority />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href, link.exact);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs transition-colors ${
                    active ? "text-orange-500" : "text-gray-300 hover:text-orange-500"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              {email[0]?.toUpperCase()}
            </div>
            <span className="hidden text-xs text-gray-400 lg:inline">{email}</span>
          </div>
          <BackstageLogoutButton />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-700 text-gray-200 transition-colors hover:border-orange-500 hover:text-orange-500 md:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="backstage-mobile-menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div
        id="backstage-mobile-menu"
        className={`md:hidden ${
          open ? "block" : "hidden"
        } absolute inset-x-0 top-full z-40 border-b border-black/10 bg-black shadow-2xl`}
      >
        <nav className="flex flex-col px-4 py-2 sm:px-8">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-3 text-sm transition-colors ${
                  active
                    ? "bg-white/5 text-orange-500"
                    : "text-gray-200 hover:bg-white/5 hover:text-orange-500"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              {email[0]?.toUpperCase()}
            </div>
            <span className="truncate text-xs text-gray-400">{email}</span>
          </div>
          <BackstageLogoutButton />
        </div>
      </div>
    </header>
  );
};

export default BackstageHeader;
