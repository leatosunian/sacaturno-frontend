import { Metadata } from "next";
import Link from "next/link";
import HeaderPublic from "@/components/home/HeaderPublic";
import Footer from "@/components/home/Footer";
import ResendConfirmationForm from "@/components/home/register/ResendConfirmationForm";
import styles from "@/app/css-modules/AuthCentered.module.css";

export const metadata: Metadata = {
  title: "Reenviar activación — SacaTurno",
  description: "Reenviá el correo de activación de tu cuenta en SacaTurno.",
  robots: { index: false, follow: false },
};

export default function ResendConfirmation() {
  return (
    <>
      <HeaderPublic />

      <main className={styles.authBg}>
        <div className="relative z-[2] flex flex-col items-center gap-[18px] max-[1535px]:gap-3 w-full max-w-[460px]">

          <span className="inline-flex items-center gap-[7px] px-[13px] max-[1535px]:px-[11px] py-[5px] max-[1535px]:py-1 rounded-[20px] bg-[#ffe9dc] text-[#dd4924] text-[10.5px] max-[1535px]:text-[9.5px] font-semibold tracking-[0.7px] uppercase">
            activación de cuenta
          </span>

          <h1 className="m-0 text-[34px] max-[1535px]:text-[28px] font-bold tracking-[-1.2px] max-[1535px]:tracking-[-0.9px] text-[#1a1a1a] text-center leading-[1.05]">
            ¿No recibiste el correo?
          </h1>
          <p className="-mt-1 max-[1535px]:-mt-0.5 text-[14px] max-[1535px]:text-[13px] text-[#7a7a7a] text-center max-w-[400px] leading-[1.55]">
            Ingresá tu correo y te enviamos el link de activación nuevamente.
          </p>

          <div className="w-full bg-white rounded-[15px] shadow-[-10px_10px_25px_1px_rgba(0,0,0,0.12)] border border-black/[0.06] overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-[#dd4924] to-[#ff8a5c]" />

            <div className="flex p-1 mx-7 max-[1535px]:mx-[22px] mt-6 max-[1535px]:mt-[18px] bg-black/[0.04] rounded-[9px]">
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-2 text-[#6a6a6a] text-xs font-semibold no-underline hover:text-[#dd4924] transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Volver al inicio de sesión
              </Link>
            </div>

            <div className="pt-5 max-[1535px]:pt-[14px] px-7 max-[1535px]:px-[22px] pb-7 max-[1535px]:pb-[22px]">
              <ResendConfirmationForm />
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
