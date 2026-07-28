"use client";
import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { HiOutlineMail } from "react-icons/hi";
import { MdCheckCircleOutline, MdInfoOutline } from "react-icons/md";
import axiosReq from "@/config/axios";

const RESEND_COOLDOWN = 60;

interface Props {
  email: string;
}

export default function AccountCreatedModal({ email }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "success" | "error" | "already_verified">("idle");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setResendStatus("idle");
    try {
      const res = await axiosReq.post(`/user/resend-confirmation/${encodeURIComponent(email)}`);
      const data = res.data?.response_data;
      if (data === "EMAIL_SENT") {
        setResendStatus("success");
        setCooldown(RESEND_COOLDOWN);
      } else if (data === "USER_ALREADY_VERIFIED") {
        setResendStatus("already_verified");
      } else {
        setResendStatus("error");
      }
    } catch {
      setResendStatus("error");
    } finally {
      setResendLoading(false);
    }
  }, [email, cooldown, resendLoading]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => router.push("/login")}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto p-7 flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-50">
          <HiOutlineMail size={32} color="#dd4924" />
        </div>

        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">¡Cuenta creada!</h2>
          <p className="text-[15px] text-gray-500 leading-relaxed">
            Te enviamos un correo de confirmación a{" "}
            <span className="font-semibold text-gray-700">{email}</span>.
            Revisá tu bandeja de entrada y activá tu cuenta para poder iniciar sesión.
          </p>
          <div className="flex items-start gap-2.5 w-full bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-left">
            <MdInfoOutline size={17} className="text-[#dd4924] shrink-0 mt-0.5" />
            <p className="text-xs text-orange-700 leading-relaxed">
              Si no lo encontrás, revisá la carpeta de <span className="font-semibold">correo no deseado</span> o spam.
            </p>
          </div>
        </div>

        {/* Resend section */}
        <div className="w-full flex flex-col items-center gap-2">
          {resendStatus === "success" && (
            <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
              <MdCheckCircleOutline size={15} />
              <span>Correo reenviado correctamente</span>
            </div>
          )}
          {resendStatus === "error" && (
            <p className="text-xs text-red-500">
              Ocurrió un error al reenviar. Intentá de nuevo.
            </p>
          )}
          {resendStatus === "already_verified" && (
            <p className="text-xs text-gray-500">
              Tu cuenta ya está verificada. Podés iniciar sesión.
            </p>
          )}

          <button
            onClick={handleResend}
            disabled={cooldown > 0 || resendLoading}
            className="text-xs hover:text-orange-400 text-[#dd4924] disabled:text-gray-300 disabled:cursor-not-allowed transition-colors duration-200 underline underline-offset-2 cursor-pointer"
          >
            {resendLoading
              ? "Enviando..."
              : cooldown > 0
              ? `Reenviar en ${cooldown}s`
              : "¿No recibiste el correo? Reenviar"}
          </button>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="w-full py-3 rounded-xl bg-[#dd4924] hover:bg-[#c23e1e] text-white text-sm font-semibold transition-colors duration-200 cursor-pointer"
        >
          Entendido
        </button>
      </div>
    </div>,
    document.body
  );
}
