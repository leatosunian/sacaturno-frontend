"use client";
import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setPasswordSchema } from "@/app/schemas/setPasswordSchema";
import axiosReq from "@/config/axios";
import { toast } from "sonner";
import { LuLock, LuShieldCheck } from "react-icons/lu";
import { AiOutlineExclamationCircle } from "react-icons/ai";

interface Props {
  hasPassword: boolean;
}

interface formInputs {
  password: string;
  confirmPassword: string;
}

// Deja crear una contraseña de respaldo a cuentas sin contraseña (típicamente
// creadas con Google), para poder ingresar con email si pierden el acceso a
// Google. Cuentas que ya tienen contraseña cambian por el flujo de recuperación.
export default function PasswordSecuritySection({ hasPassword }: Props) {
  const [done, setDone] = useState<boolean>(hasPassword);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<formInputs>({
    resolver: zodResolver(setPasswordSchema),
  });

  if (done) return null;

  const onSubmit = async (data: FieldValues) => {
    setLoading(true);
    const token = localStorage.getItem("sacaturno_token");
    try {
      const res = await axiosReq.post(
        "/user/password/set",
        { password: data.password },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = res.data.response_data;
      if (result === "PASSWORD_SET") {
        toast.success(
          "Contraseña creada. Ya podés ingresar con tu email y contraseña."
        );
        reset();
        setDone(true);
      } else if (result === "PASSWORD_ALREADY_SET") {
        toast.error("Tu cuenta ya tiene una contraseña configurada.");
        setDone(true);
      } else {
        toast.error("No se pudo crear la contraseña. Intentá de nuevo.");
      }
    } catch {
      toast.error("Error al crear la contraseña. Intentá de nuevo.");
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden w-full max-w-4xl"
    >
      <div className="px-6 py-4 2xl:px-8 2xl:py-5 border-b border-gray-100 flex items-center gap-2">
        <LuLock size={16} className="text-orange-600" />
        <h2 className="text-sm 2xl:text-base font-semibold text-gray-800">
          Contraseña de acceso
        </h2>
      </div>

      <div className="p-6 2xl:p-8 flex flex-col gap-5">
        <div className="flex items-start gap-2.5 rounded-lg bg-orange-50 border border-orange-100 px-4 py-3">
          <AiOutlineExclamationCircle
            className="text-orange-600 mt-0.5 shrink-0"
            size={16}
          />
          <p className="text-xs 2xl:text-sm text-gray-600 leading-relaxed">
            Tu cuenta ingresa con Google y no tiene una contraseña. Creá una
            para poder acceder también con tu email, por si algún día perdés el
            acceso a tu cuenta de Google.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-5 w-full">
          <div className="flex flex-col gap-1">
            <label className="text-xs 2xl:text-sm font-medium text-gray-700">
              Nueva contraseña
            </label>
            <input
              type="password"
              autoComplete="new-password"
              {...register("password")}
              placeholder="Al menos 6 caractéres"
              className={`h-8 2xl:h-10 w-full rounded-md border px-3 text-xs 2xl:text-sm bg-gray-50 transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none ${
                errors.password ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.password?.message && (
              <span className="text-xs 2xl:text-sm text-red-500">
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs 2xl:text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <input
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              placeholder="Repetí la contraseña"
              className={`h-8 2xl:h-10 w-full rounded-md border px-3 text-xs 2xl:text-sm bg-gray-50 transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none ${
                errors.confirmPassword ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.confirmPassword?.message && (
              <span className="text-xs 2xl:text-sm text-red-500">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end px-6 2xl:px-8 py-4 2xl:py-5 border-t border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center w-32 h-9">
            <div className="loaderSmall" />
          </div>
        ) : (
          <button
            type="submit"
            className="flex items-center gap-2 bg-primary hover:bg-orange-500 text-white text-xs 2xl:text-sm font-semibold px-5 2xl:px-6 py-2.5 2xl:py-3 rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
          >
            <LuShieldCheck size={14} />
            Crear contraseña
          </button>
        )}
      </div>
    </form>
  );
}
