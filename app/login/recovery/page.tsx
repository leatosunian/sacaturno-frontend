import { Metadata } from "next";
import Link from "next/link";
import { LuCalendarDays } from "react-icons/lu";
import HeaderPublicBlack from "@/components/home/HeaderPublicBlack";
import PasswordRecovery from "@/components/home/passwordRecovery/PasswordRecovery";
import styles from "@/app/css-modules/AuthCentered.module.css";

export const metadata: Metadata = {
  title: "Recuperar contraseña — SacaTurno",
  description: "Recuperá el acceso a tu cuenta de SacaTurno.",
  robots: { index: false, follow: false },
};

export default function RecoverPassword() {
  return (
    <>
      <HeaderPublicBlack />

      <main className={styles.authBg}>
        <div className="relative z-[2] flex flex-col items-center gap-[18px] max-[1535px]:gap-3 w-full max-w-[460px]">

          <span className="inline-flex items-center gap-[7px] px-[13px] max-[1535px]:px-[11px] py-[5px] max-[1535px]:py-1 rounded-[20px] bg-[#fff1e8] text-[#dd4924] text-[10.5px] max-[1535px]:text-[9.5px] font-semibold tracking-[0.7px] uppercase">
            <LuCalendarDays size={12} />
            SacaTurno
          </span>

          <h1 className="m-0 text-[38px] max-[1535px]:text-[30px] font-bold tracking-[-1.4px] max-[1535px]:tracking-[-1px] text-[#1a1a1a] text-center leading-[1.05]">
            Recuperá tu acceso.
          </h1>
          <p className="-mt-1 max-[1535px]:-mt-0.5 text-[14px] max-[1535px]:text-[13px] text-[#7a7a7a] text-center max-w-[400px] leading-[1.55]">
            Ingresá tu correo y te enviamos un enlace para restablecer tu contraseña.
          </p>

          <div className="w-full bg-white rounded-[15px] shadow-[-10px_10px_25px_1px_rgba(0,0,0,0.12)] border border-black/[0.06] overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-[#dd4924] to-[#ff8a5c]" />

            <Link href="/login" className="inline-flex items-center gap-[5px] mx-7 mt-5 text-xs font-semibold text-[#6a6a6a] no-underline transition-colors duration-200 hover:text-[#dd4924]">
              ← Volver a iniciar sesión
            </Link>

            <div className="pt-5 max-[1535px]:pt-[14px] px-7 max-[1535px]:px-[22px] pb-7 max-[1535px]:pb-[22px]">
              <PasswordRecovery />
            </div>
          </div>

          <p className="text-[11px] text-[#a0a0a0] text-center">
            Al continuar aceptás nuestros{" "}
            <a href="/terminos" className="text-[#6a6a6a] font-semibold no-underline hover:text-[#dd4924]">términos</a> y{" "}
            <a href="/privacidad" className="text-[#6a6a6a] font-semibold no-underline hover:text-[#dd4924]">política de privacidad</a>.
          </p>

        </div>
      </main>
    </>
  );
}
