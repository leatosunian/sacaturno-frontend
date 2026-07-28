"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosReq from "@/config/axios";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { LuCheck } from "react-icons/lu";

interface Props {
  token: string;
  employeeName: string;
  businessName: string;
  hasExistingUser: boolean;
}

export default function InviteForm({ token, employeeName, businessName, hasExistingUser }: Props) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    if (!hasExistingUser) {
      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden.");
        return;
      }
    }
    setError("");
    setLoading(true);
    try {
      await axiosReq.post(`/employee/accept/${token}`, hasExistingUser ? {} : { password });
      setAccepted(true);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 410) setError("Esta invitación expiró. Pedile al dueño que te envíe una nueva.");
      else if (status === 409) setError("Esta invitación ya fue aceptada.");
      else setError("Ocurrió un error. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (accepted) {
    return (
      <div className="flex flex-col items-center gap-5 pt-2 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-50 border border-green-200">
          <LuCheck size={28} className="text-green-600" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-gray-800">¡Bienvenido/a al equipo!</p>
          <p className="text-xs text-gray-500">
            Tu cuenta está activa. Ya podés iniciar sesión con tu email en SacaTurno.
          </p>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="w-full h-10 rounded-lg bg-primary hover:bg-orange-500 text-white text-sm font-semibold transition-colors"
        >
          Ir al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); handleAccept(); }}>
      <div className="flex flex-col gap-1 text-center -mt-1">
        <p className="text-sm text-gray-600">
          <b>{businessName}</b> te invitó a unirte a su equipo como empleado.
        </p>
        {hasExistingUser ? (
          <p className="text-xs text-gray-400">
            Usarás tu contraseña actual para acceder.
          </p>
        ) : (
          <p className="text-xs text-gray-400">
            Creá una contraseña para activar tu cuenta.
          </p>
        )}
      </div>

      {!hasExistingUser && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] font-medium uppercase">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="h-[38px] sm:h-[30px] w-full border border-black/10 rounded-[7px] bg-black/5 text-[14px] sm:text-[13px] px-2.5 transition-all ease-in-out duration-200 cursor-pointer hover:border-[#dd4924] focus:bg-black/[0.08] focus:border-[#dd4924] focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] font-medium uppercase">Repetir contraseña</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repetí tu contraseña"
              className="h-[38px] sm:h-[30px] w-full border border-black/10 rounded-[7px] bg-black/5 text-[14px] sm:text-[13px] px-2.5 transition-all ease-in-out duration-200 cursor-pointer hover:border-[#dd4924] focus:bg-black/[0.08] focus:border-[#dd4924] focus:outline-none"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5">
          <AiOutlineExclamationCircle color="red" size={14} />
          <span className="text-xs text-red-600">{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || (!hasExistingUser && (!password || !confirmPassword))}
        className="w-full h-11 rounded-lg bg-primary hover:bg-orange-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center justify-center"
      >
        {loading ? <span className="loaderSmall" /> : "Aceptar invitación"}
      </button>
    </form>
  );
}
