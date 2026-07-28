"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosReq from "@/config/axios";
import Link from "next/link";

const schema = z.object({
  email: z.string().email("Ingresá un correo válido"),
});

type FormValues = z.infer<typeof schema>;

type Status = "idle" | "loading" | "sent" | "already_verified" | "not_found" | "error";

export default function ResendConfirmationForm() {
  const [status, setStatus] = useState<Status>("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: FormValues) => {
    setStatus("loading");
    try {
      const res = await axiosReq.post(`/user/resend-confirmation/${email}`);
      const data = res.data?.response_data;
      if (data === "EMAIL_SENT") return setStatus("sent");
      if (data === "USER_ALREADY_VERIFIED") return setStatus("already_verified");
      if (data === "USER_NOT_FOUND") return setStatus("not_found");
      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dd4924" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>
        <p className="text-[14px] text-[#3a3a3a] leading-[1.55]">
          Te reenviamos el correo de activación. Revisá tu bandeja de entrada y también la carpeta de <strong className="text-[#3a3a3a]">spam o correo no deseado</strong>.
        </p>
        <Link href="/login" className="mt-1 text-[13px] text-[#dd4924] font-semibold no-underline hover:opacity-75">
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  if (status === "already_verified") {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p className="text-[14px] text-[#3a3a3a] leading-[1.55]">
          Tu cuenta <strong className="text-[#3a3a3a]">ya está activada</strong>. Podés iniciar sesión directamente.
        </p>
        <Link href="/login" className="mt-1 text-[13px] text-[#dd4924] font-semibold no-underline hover:opacity-75">
          Ir al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-[12.5px] font-semibold text-[#3a3a3a]">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          className="w-full px-3.5 py-2.5 rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1a1a1a] placeholder-[#b0b0b0] outline-none focus:border-[#dd4924] focus:ring-2 focus:ring-[#dd4924]/10 transition-all"
          {...register("email")}
        />
        {errors.email && (
          <span className="text-[11.5px] text-red-500">{errors.email.message}</span>
        )}
      </div>

      {status === "not_found" && (
        <p className="text-[12.5px] text-red-500 text-center">
          No encontramos una cuenta con ese correo.
        </p>
      )}
      {status === "error" && (
        <p className="text-[12.5px] text-red-500 text-center">
          Ocurrió un error. Intentá de nuevo más tarde.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-2.5 rounded-[8px] bg-[#dd4924] text-white text-[13.5px] font-semibold tracking-[0.2px] hover:bg-[#c73e1d] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Enviando…" : "Reenviar correo de activación"}
      </button>

      <p className="text-center text-[12px] text-[#8a8a8a]">
        ¿Ya activaste tu cuenta?{" "}
        <Link href="/login" className="text-[#dd4924] font-semibold no-underline hover:opacity-75">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
