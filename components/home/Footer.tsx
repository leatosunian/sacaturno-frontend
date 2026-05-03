"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import logo from "@/public/sacaturno-orange.svg";

const COLUMNS = [
  {
    title: "Navegación",
    links: [
      { label: "Funciones", href: "/#features" },
      { label: "Precios", href: "/#pricing" },
      { label: "Preguntas frecuentes", href: "/#faq" },
    ],
  },
  {
    title: "Nuestro servicio",
    links: [
      { label: "Preguntas frecuentes", href: "/#faq" },
      { label: "Términos y condiciones", href: "/faq/terminos" },
      { label: "Política de privacidad", href: "/faq/privacidad" },
    ],
  },
  {
    title: "Tu cuenta",
    links: [
      { label: "Iniciar sesión", href: "/login" },
      { label: "Registrarme", href: "/register" },
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const hash = href.startsWith("/#") ? href.slice(1) : href;
    const id = hash.replace("#", "");

    const doScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 68;
        window.scrollTo({ top, behavior: "smooth" });
      }
    };

    if (pathname === "/") {
      doScroll();
    } else {
      router.push("/");
      setTimeout(doScroll, 400);
    }
  };

  return (
    <footer className="bg-[#0a0a0a] pt-14 pb-8 border-t border-white/10">
      <div className="max-w-[1200px] mx-auto px-8">
        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Image
              src={logo}
              alt="Logo de SacaTurno"
              width={200}
              className="mb-5"
            />
            <p className="text-[13px] text-white/40 leading-[1.7] max-w-[240px]">
              La forma más simple de gestionar turnos, ahorrar tiempo y hacer
              crecer tu negocio.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-[11px] font-bold text-[#dd4924] tracking-[0.8px] uppercase mb-4">
                {col.title}
              </div>
              <ul className="flex flex-col gap-0">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.includes("#") ? (
                      <a
                        href={link.href}
                        onClick={(e) => scrollTo(e, link.href)}
                        className="text-[13px] text-white/55 hover:text-white/90 transition-colors duration-150 block mb-[10px] cursor-pointer"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-[13px] text-white/55 hover:text-white/90 transition-colors duration-150 block mb-[10px]"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-wrap justify-between items-center gap-2">
          <span className="text-[12px] text-white/25">
            © {new Date().getFullYear()} SacaTurno. Todos los derechos reservados.
          </span>
          <span className="text-[12px] text-white/25">
            Desarrollado por{" "}
            <Link
              href="https://tosunian.dev"
              target="_blank"
              className="text-[#dd4924] hover:text-orange-100 transition-colors duration-150"
            >
              tosunian.dev
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
