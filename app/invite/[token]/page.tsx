import { Metadata } from "next";
import Link from "next/link";
import HeaderPublicBlack from "@/components/home/HeaderPublic";
import Footer from "@/components/home/Footer";
import axiosReq from "@/config/axios";
import styles from "@/app/css-modules/AuthCentered.module.css";
import InviteForm from "@/components/dashboard/employees/invite/InviteForm";

export const metadata: Metadata = {
  title: "Invitación de empleado — SacaTurno",
  description: "Aceptá tu invitación para unirte como empleado en SacaTurno.",
  robots: { index: false, follow: false },
};

async function getInvitationInfo(token: string) {
  try {
    const res = await axiosReq.get(`/employee/accept/${token}`);
    return { data: res.data, error: null };
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 410) return { data: null, error: "expired" };
    if (status === 409) return { data: null, error: "already_accepted" };
    return { data: null, error: "invalid" };
  }
}

export default async function InvitePage({ params }: { params: { token: string } }) {
  const { data, error } = await getInvitationInfo(params.token);

  return (
    <>
      <HeaderPublicBlack />

      <main className={styles.authBg}>
        <div className="relative z-[2] flex flex-col items-center gap-[18px] max-[1535px]:gap-3 w-full max-w-[460px]">

          <span className="inline-flex items-center gap-[7px] px-[13px] max-[1535px]:px-[11px] py-[5px] max-[1535px]:py-1 rounded-[20px] bg-[#ffe9dc] text-[#dd4924] text-[10.5px] max-[1535px]:text-[9.5px] font-semibold tracking-[0.7px] uppercase">
            Invitación de empleado
          </span>

          <h1 className="m-0 text-[38px] max-[1535px]:text-[30px] font-bold tracking-[-1.4px] max-[1535px]:tracking-[-1px] text-[#1a1a1a] text-center leading-[1.05]">
            {error ? "Invitación inválida" : `¡Hola, ${data?.employeeName}!`}
          </h1>
          <p className="-mt-1 max-[1535px]:-mt-0.5 text-[14px] max-[1535px]:text-[13px] text-[#7a7a7a] text-center max-w-[400px] leading-[1.55]">
            {error
              ? "Este link de invitación no es válido o ya fue utilizado."
              : `Activá tu cuenta para unirte al equipo de ${data?.businessName}.`}
          </p>

          <div className="w-full bg-white rounded-[15px] shadow-[-10px_10px_25px_1px_rgba(0,0,0,0.12)] border border-black/[0.06] overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-[#dd4924] to-[#ff8a5c]" />

            <div className="pt-6 max-[1535px]:pt-[18px] px-7 max-[1535px]:px-[22px] pb-7 max-[1535px]:pb-[22px]">
              {error ? (
                <div className="flex flex-col gap-4 text-center py-2">
                  {error === "expired" && (
                    <p className="text-sm text-gray-600">
                      Esta invitación <b>expiró</b>. Las invitaciones son válidas por 72 horas. Pedile al dueño del negocio que te envíe una nueva invitación.
                    </p>
                  )}
                  {error === "already_accepted" && (
                    <p className="text-sm text-gray-600">
                      Esta invitación <b>ya fue aceptada</b>. Tu cuenta ya está activa.
                    </p>
                  )}
                  {error === "invalid" && (
                    <p className="text-sm text-gray-600">
                      El link de invitación no es válido. Verificá que hayas copiado el link completo del email.
                    </p>
                  )}
                  <Link href="/login" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
                    Ir al inicio de sesión →
                  </Link>
                </div>
              ) : (
                <InviteForm
                  token={params.token}
                  employeeName={data!.employeeName}
                  businessName={data!.businessName}
                  hasExistingUser={data!.hasExistingUser}
                />
              )}
            </div>
          </div>

          <p className="text-[11px] text-[#a0a0a0] text-center">
            Al aceptar aceptás nuestros{" "}
            <Link href="/faq/terminos" className="text-[#6a6a6a] font-semibold no-underline hover:text-[#dd4924]">términos</Link> y{" "}
            <Link href="/faq/privacidad" className="text-[#6a6a6a] font-semibold no-underline hover:text-[#dd4924]">política de privacidad</Link>.
          </p>

        </div>
      </main>

      <Footer />
    </>
  );
}
