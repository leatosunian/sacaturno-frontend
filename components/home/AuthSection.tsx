"use client";
import { useState } from "react";
import GoogleAuthButton from "./GoogleAuthButton";
import FormLogin from "./login/FormLogin";
import FormRegistrate from "./register/FormRegistrate";

interface AuthSectionProps {
  mode: "login" | "register";
}

// Coordina el estado "ocupado" entre el login con Google y el login por
// credenciales para que, mientras uno procesa, el otro quede deshabilitado
// (evita enviar ambas solicitudes a la vez).
const AuthSection = ({ mode }: AuthSectionProps) => {
  const [googleBusy, setGoogleBusy] = useState(false);
  const [formBusy, setFormBusy] = useState(false);

  return (
    <>
      <GoogleAuthButton
        text={mode === "login" ? "signin_with" : "signup_with"}
        disabled={formBusy}
        onBusyChange={setGoogleBusy}
      />

      <div className="flex items-center gap-3 my-4 max-[1535px]:my-3">
        <div className="flex-1 h-px bg-black/10" />
        <span className="text-[11px] text-[#a0a0a0] uppercase tracking-wider">o</span>
        <div className="flex-1 h-px bg-black/10" />
      </div>

      {mode === "login" ? (
        <FormLogin disabled={googleBusy} onLoadingChange={setFormBusy} />
      ) : (
        <FormRegistrate disabled={googleBusy} onLoadingChange={setFormBusy} />
      )}
    </>
  );
};

export default AuthSection;
