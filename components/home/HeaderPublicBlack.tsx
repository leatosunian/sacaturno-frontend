"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { NextPage } from "next";
import { MdLogin, MdSearch } from "react-icons/md";
import Image from "next/image"

interface Props { }

const HeaderPublicBlack: NextPage<Props> = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#features", label: "Funciones" },
    { href: "#pricing", label: "Precios" },
    { href: "#testimonials", label: "Testimonios" },
    { href: "#faq", label: "FAQ" },
  ];

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string, close = false) => {
    e.preventDefault();
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: "smooth" });
    }
    if (close) setMenuOpen(false);
  };

  return (
    <>
      <nav
        className={[
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled || menuOpen
            ? "bg-white/97 backdrop-blur-lg border-b border-transparent border-black/7 shadow-sm"
            : "bg-transparent",
        ].join(" ")}
      >
        <div className="max-w-[1200px] mx-auto justify-between px-8 h-[68px] flex items-center">
          {/* 1 — Logo */}
          {/* <div className="flex items-center">
            <Link
              href="/"
              className="text-[21px] font-light tracking-[-0.8px] text-[#1a1a1a] whitespace-nowrap"
            >
              sacaturno<span className="text-[#dd4924]">.</span>

            </Link>
          </div> */}
          <div className="flex items-center">
            <Link
              href="/"
              className="w-28"
            >
              <Image
                src="/sacaturno-orange.svg"
                alt="SacaTurno"
                width={50}
                height={45}
                className="pageLoaderLogo"
              />
            </Link>
          </div>

          {/* 2 — Nav links (centro) */}
          <div className="hidden overflow-hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                className="text-[13px] hover:text-[#dd4924] font-medium text-[#5a5a5a] transition-all duration-300 ease-in-out cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* 3 — Botones (derecha) */}
          <div className="hidden md:flex items-center justify-end gap-2">
            <Link
              href="/public/search"
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium border border-black/20 rounded-lg text-[#1a1a1a] hover:bg-[#dd4924] hover:text-white hover:border-[#dd4924] transition-all duration-200"
            >
              <MdSearch size={15} />
              Buscar negocio
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium border border-black/20 rounded-lg text-[#1a1a1a] hover:bg-[#dd4924] hover:text-white hover:border-[#dd4924] transition-all duration-200"
            >
              <MdLogin size={15} />
              Ingresar
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-xs font-bold bg-[#dd4924] text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Probar gratis
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-[5px] cursor-pointer bg-transparent border-none p-1"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menú"
          >
            <span
              className="block w-[22px] h-[2px] bg-[#1a1a1a] rounded-[2px] transition-all duration-250"
              style={{ transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }}
            />
            <span
              className="block w-[22px] h-[2px] bg-[#1a1a1a] rounded-[2px] transition-all duration-250"
              style={{ opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block w-[22px] h-[2px] bg-[#1a1a1a] rounded-[2px] transition-all duration-250"
              style={{ transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }}
            />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden flex flex-col bg-white/97 backdrop-blur-lg border-b border-black/7 px-8 pb-5 pt-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href, true)}
                className="text-[14px] font-medium text-[#5a5a5a] py-3 border-b border-[#5a5a5a]/10 last:border-none cursor-pointer"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              <Link
                href="/public/search"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-[13px] font-semibold border border-[#5a5a5a] rounded-lg text-[#1a1a1a] hover:bg-[#dd4924] hover:text-white hover:border-[#dd4924] transition-all duration-200"
              >
                <MdSearch size={16} />
                Buscar negocio
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-[13px] font-semibold border border-[#5a5a5a] rounded-lg text-[#1a1a1a] hover:bg-[#dd4924] hover:text-white hover:border-[#dd4924] transition-all duration-200"
              >
                <MdLogin size={16} />
                Ingresar
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="bg-[#dd4924] text-white text-[14px] font-bold py-3 rounded-[10px] text-center"
              >
                Probar gratis
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>)
}
export default HeaderPublicBlack;