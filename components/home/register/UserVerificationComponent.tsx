"use client";
import { IUser } from "@/interfaces/user.interface";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  userData: IUser;
};

const UserVerificationComponent = ({ userData }: Props) => {
  const [isUser, setIsUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    if (userData === undefined) {
      return setIsUser(false);
    }
    if (userData._id) {
      return setIsUser(true);
    }
  }, [userData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full" style={{ minHeight: "calc(100vh - 64px)" }}>
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* orange accent bar */}
        <div className="h-1.5 w-full bg-orange-600" />

        <div className="flex flex-col items-center gap-6 px-8 py-10">
          {/* icon */}
          <div
            className={`flex items-center justify-center w-20 h-20 rounded-full ${
              isUser ? "bg-green-50" : "bg-red-50"
            }`}
          >
            {isUser ? (
              <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* heading */}
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
              {isUser ? "¡Cuenta activada!" : "Error al activar tu cuenta"}
            </h1>
            {isUser && (
              <span className="rounded-full text-orange-600 bg-orange-50 px-4 py-1 text-sm font-medium">
                Ya podés iniciar sesión
              </span>
            )}
          </div>

          {/* body */}
          <div className="flex flex-col gap-4 text-center">
            {isUser ? (
              <>
                <p className="text-sm font-medium text-gray-600">
                  ¡Gracias <span className="font-bold text-gray-900">{userData?.name}</span> por registrarte en SacaTurno!
                  Comenzá a configurar tu empresa y a cargar tus turnos.
                </p>
                <div className="flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-left">
                  <span className="text-base">🔔</span>
                  <p className="text-sm text-orange-800 font-medium">
                    Disponés de un <span className="font-bold">período de prueba gratuito de 15 días</span> que se activará cuando crees tu empresa.
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-600">
                  No se pudo activar tu cuenta. Es posible que ya haya sido activada anteriormente o que haya ocurrido un error durante la verificación.
                </p>
                <p className="text-sm text-gray-500">
                  ¿Tenés problemas?{" "}
                  <Link
                    href="mailto:leandrotosunian@hotmail.com"
                    target="_blank"
                    className="font-semibold text-orange-600 hover:underline transition-all duration-200"
                  >
                    Contactanos
                  </Link>
                </p>
              </>
            )}
          </div>

          {/* CTA */}
          <Link
            href="/login"
            className="w-full text-center py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 ease-in-out uppercase tracking-wide"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserVerificationComponent;
