"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import axiosReq from "@/config/axios";
import { useAuth } from "@/hooks/useAuth";
import { completeLogin } from "@/lib/completeLogin";
import { AiOutlineExclamationCircle } from "react-icons/ai";

interface GoogleCredentialResponse {
  credential: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>,
          ) => void;
        };
      };
    };
  }
}

interface GoogleAuthButtonProps {
  // "signin_with" para /login, "signup_with" para /register
  text?: "signin_with" | "signup_with" | "continue_with";
  // true cuando el otro método (email/contraseña) está procesando: bloquea Google.
  disabled?: boolean;
  // Reporta al contenedor si el login con Google está en curso.
  onBusyChange?: (busy: boolean) => void;
}

const GoogleAuthButton = ({
  text = "signin_with",
  disabled = false,
  onBusyChange,
}: GoogleAuthButtonProps) => {
  const btnRef = useRef<HTMLDivElement>(null);
  const { saveAuthData } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    onBusyChange?.(loading);
  }, [loading, onBusyChange]);

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      setLoading(true);
      setError("");
      try {
        const res = await axiosReq.post("/user/google", {
          credential: response.credential,
        });
        if (typeof res.data.response_data === "object") {
          const needsContext = await completeLogin(
            res.data.response_data,
            saveAuthData,
          );
          router.push(
            needsContext ? "/admin/select-context" : "/admin/dashboard",
          );
          router.refresh();
          return;
        }
        setError("No pudimos iniciar sesión con Google. Intentá de nuevo.");
        setLoading(false);
      } catch {
        setError("Error al conectar con Google. Intentá de nuevo.");
        setLoading(false);
      }
    },
    [router, saveAuthData],
  );

  const initialize = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!window.google || !btnRef.current || !clientId) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredential,
    });

    // Evita botones duplicados si initialize corre más de una vez sobre el mismo div.
    btnRef.current.innerHTML = "";
    const containerWidth =
      btnRef.current.parentElement?.offsetWidth ?? 320;
    window.google.accounts.id.renderButton(btnRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text,
      shape: "rectangular",
      logo_alignment: "center",
      width: Math.min(containerWidth, 400),
    });
  }, [handleCredential, text]);

  // Al navegar entre /login y /register (soft navigation de Next) el script de
  // Google ya está cargado, por lo que el onLoad del <Script> no vuelve a
  // dispararse. En ese caso renderizamos el botón acá al montar el componente.
  useEffect(() => {
    if (window.google?.accounts?.id) {
      initialize();
    }
  }, [initialize]);

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initialize}
      />
      <div className="relative w-full flex justify-center">
        <div
          ref={btnRef}
          className={`flex justify-center w-full [color-scheme:light] ${
            loading ? "invisible" : ""
          }`}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center gap-2.5 rounded-[4px] border border-[#dadce0] bg-white cursor-not-allowed select-none">
            <div className="loaderSmall !w-[20px] !border-[2.5px]" />
            <span className="text-[13px] font-medium text-[#3c4043]">
              Ingresando…
            </span>
          </div>
        )}
        {disabled && !loading && (
          <div className="absolute inset-0 rounded-[4px] bg-white/60 cursor-not-allowed" />
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1 w-fit h-fit">
          <AiOutlineExclamationCircle color="red" />
          <span className="text-xs">{error}</span>
        </div>
      )}
    </div>
  );
};

export default GoogleAuthButton;
