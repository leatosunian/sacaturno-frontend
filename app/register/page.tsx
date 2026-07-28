import { Metadata } from "next";
import Link from "next/link";
import HeaderPublic from "@/components/home/HeaderPublic";
import Footer from "@/components/home/Footer";
import AuthSection from "@/components/home/AuthSection";
import styles from "@/app/css-modules/AuthCentered.module.css";

export const metadata: Metadata = {
  title: "Registrate gratis — SacaTurno",
  description: "Creá tu cuenta en SacaTurno y empezá a gestionar tus turnos online con 30 días de prueba gratuita.",
  robots: { index: false, follow: false },
};

export default function Register() {
  return (
    <>
      <HeaderPublic />

      <main className={styles.authBg}>
        <div className="relative z-[2] flex flex-col items-center gap-[18px] max-[1535px]:gap-3 w-full max-w-[460px]">

          <span className="inline-flex items-center gap-[7px] px-[13px] max-[1535px]:px-[11px] py-[5px] max-[1535px]:py-1 rounded-[20px] bg-[#ffe9dc] text-[#dd4924] text-[10.5px] max-[1535px]:text-[9.5px] font-semibold tracking-[0.7px] uppercase">
            {/* <LuCalendarDays size={12} /> */}
            registrate
          </span>

          <h1 className="m-0 text-[38px] max-[1535px]:text-[30px] font-bold tracking-[-1.4px] max-[1535px]:tracking-[-1px] text-[#1a1a1a] text-center leading-[1.05]">
            Empezá hoy, gratis.
          </h1>
          <p className="-mt-1 max-[1535px]:-mt-0.5 text-[14px] max-[1535px]:text-[13px] text-[#7a7a7a] text-center max-w-[400px] leading-[1.55]">
            Creá tu cuenta y configurá tu negocio en menos de 5 minutos. Sin tarjeta de crédito.
          </p>

          <div className="w-full bg-white rounded-[15px] shadow-[-10px_10px_25px_1px_rgba(0,0,0,0.12)] border border-black/[0.06] overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-[#dd4924] to-[#ff8a5c]" />

            <div className="flex p-1 mx-7 max-[1535px]:mx-[22px] mt-6 max-[1535px]:mt-[18px] bg-black/[0.04] rounded-[9px]">
              <Link href="/login" className="flex-1 py-2 px-3 bg-transparent rounded-[6px] text-[#6a6a6a] text-xs font-semibold cursor-pointer text-center no-underline block transition-all duration-200 ease-in-out">
                Iniciar sesión
              </Link>
              <Link href="/register" className="flex-1 py-2 px-3 bg-white rounded-[6px] text-[#dd4924] text-xs font-semibold cursor-pointer text-center no-underline block transition-all duration-200 ease-in-out shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                Registrate
              </Link>
            </div>

            <div className="pt-5 max-[1535px]:pt-[14px] px-7 max-[1535px]:px-[22px] pb-7 max-[1535px]:pb-[22px]">
              <AuthSection mode="register" />
            </div>
          </div>

          <p className="text-[11px] text-[#a0a0a0] text-center">
            Al continuar aceptás nuestros{" "}
            <Link href="/faq/terminos" className="text-[#6a6a6a] font-semibold no-underline hover:text-[#dd4924]">términos</Link> y{" "}
            <Link href="/faq/privacidad" className="text-[#6a6a6a] font-semibold no-underline hover:text-[#dd4924]">política de privacidad</Link>.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
