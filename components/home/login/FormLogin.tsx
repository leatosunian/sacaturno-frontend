"use client";
import { useEffect, useState } from "react";
import stylesHome from "@/app/css-modules/HomeWhite.module.css";
import axiosReq from "@/config/axios";
import AlertInterface from "@/interfaces/alert.interface";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/app/schemas/loginSchema";
import FormAlert from "@/components/FormAlert";
import { completeLogin } from "@/lib/completeLogin";

interface formInputs {
  password: string;
  email: string;
}

interface FormLoginProps {
  // true cuando el login con Google está procesando: bloquea el submit por credenciales.
  disabled?: boolean;
  // Reporta al contenedor si este formulario está procesando.
  onLoadingChange?: (loading: boolean) => void;
}

const FormLogin = ({ disabled = false, onLoadingChange }: FormLoginProps) => {
  const [alert, setAlert] = useState<AlertInterface>({
    alertType: "ERROR_ALERT",
    error: false,
    msg: "",
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formInputs>({
    resolver: zodResolver(loginSchema),
  });

  const { saveAuthData } = useAuth();
  const router = useRouter();

  const hideAlert = () => {
    setTimeout(() => {
      setAlert({ error: false, alertType: "ERROR_ALERT", msg: "" });
    }, 6000);
  };

  const handleLogin = async (data: FieldValues) => {
    if (disabled) return;
    if (data) {
      setLoading(true);
      try {
        const login = await axiosReq.post(`/user/login`, data);

        if (typeof login.data.response_data === "object") {
          let needsContextSelection = false;
          try {
            needsContextSelection = await completeLogin(
              login.data.response_data,
              saveAuthData,
            );
          } catch (error) {
            setLoading(false);
            setAlert({
              alertType: "ERROR_ALERT",
              error: true,
              msg: "Error al iniciar sesión",
            });
            return;
          }

          setAlert({ alertType: "ERROR_ALERT", error: false, msg: "" });
          hideAlert();
          router.push(
            needsContextSelection
              ? "/admin/select-context"
              : "/admin/dashboard",
          );
          router.refresh();
          return;
        }
        if (login.data.response_data === "USE_GOOGLE_LOGIN") {
          setAlert({
            alertType: "ERROR_ALERT",
            error: true,
            msg: "Esta cuenta se creó con Google. Ingresá con el botón de Google.",
          });
          hideAlert();
          setLoading(false);
          return;
        }
        if (login.data.response_data === "USER_NOT_VERIFIED") {
          setAlert({
            alertType: "ERROR_ALERT",
            error: true,
            msg: "Debes confirmar tu correo para ingresar",
          });
          hideAlert();
          setLoading(false);
          return;
        }
        if (
          login.data.response_data === "WRONG_PASSWORD" ||
          login.data.response_data === "USER_NOT_FOUND"
        ) {
          setAlert({
            alertType: "ERROR_ALERT",
            error: true,
            msg: "Usuario o contraseña incorrectos",
          });
          hideAlert();
          setLoading(false);
          return;
        }
      } catch (error) {
        setAlert({
          alertType: "ERROR_ALERT",
          error: true,
          msg: "Error al iniciar sesión",
        });
        return;
      }
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit((data) => {
          handleLogin(data);
        })}
        className="w-full flex flex-col gap-5 max-[1535px]:gap-[14px]"
      >
        <div className="w-full flex flex-col gap-0.5">
          <span className="text-[12px] font-medium uppercase">
            Correo electrónico
          </span>
          <input
            type="email"
            {...register("email")}
            placeholder="Ingresá tu email"
            className="h-[38px] sm:h-[26px] lg:h-[28px] 2xl:h-[30px] w-full border border-black/10 rounded-[7px] bg-black/5 text-[14px] sm:text-[11px] lg:text-[12px] 2xl:text-[13px] px-2.5 transition-all ease-in-out duration-200 cursor-pointer hover:border-[#dd4924] focus:bg-black/[0.08] focus:border-[#dd4924] focus:outline-none"
          />
          {errors.email?.message && (
            <div className="flex items-center gap-1 mt-1 w-fit h-fit">
              <AiOutlineExclamationCircle color="red" />
              <span className="text-xs">{errors.email.message}</span>
            </div>
          )}
        </div>

        <div className="w-full flex flex-col gap-0.5">
          <span className="text-[12px] font-medium uppercase">Contraseña</span>
          <input
            type="password"
            {...register("password")}
            placeholder="Ingresá tu contraseña"
            className="h-[38px] sm:h-[26px] lg:h-[28px] 2xl:h-[30px] w-full border border-black/10 rounded-[7px] bg-black/5 text-[14px] sm:text-[11px] lg:text-[12px] 2xl:text-[13px] px-2.5 transition-all ease-in-out duration-200 cursor-pointer hover:border-[#dd4924] focus:bg-black/[0.08] focus:border-[#dd4924] focus:outline-none"
          />
          {errors.password?.message && (
            <div className="flex items-center gap-1 mt-1 w-fit h-fit">
              <AiOutlineExclamationCircle color="red" />
              <span className="text-xs">{errors.password.message}</span>
            </div>
          )}
        </div>

        {alert.error !== false && (
          <FormAlert
            msg={alert.msg}
            error={alert.error}
            alertType={alert.alertType}
          />
        )}

        <div className="flex flex-col gap-2 my-2 md:gap-0 w-fit h-fit">
          <span className="mb-3 text-xs font-light">
            ¿Olvidaste tu contraseña?{"  "}
            <Link
              className="font-semibold cursor-pointer blackOrangeHover"
              href="/login/recovery"
            >
              Recuperar contraseña
            </Link>
          </span>
          <span className="text-xs font-light">
            ¿No activaste tu cuenta?{"  "}
            <Link
              className="font-semibold cursor-pointer blackOrangeHover"
              href="/resend-confirmation"
            >
              Reenviar activación
            </Link>
          </span>
        </div>

        <div className="flex items-center justify-center w-full mt-0 h-fit">
          {loading && (
            <div
              style={{ height: "100%", width: "100%" }}
              className="flex items-center justify-center w-full"
            >
              <div className="loaderSmall"></div>
            </div>
          )}
          {!loading && (
            <button
              type="submit"
              disabled={disabled}
              className={`${stylesHome.btnAnimated} rounded-lg ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                fontSize: "13px",
                letterSpacing: ".5px",
                width: "100%",
                padding: "11px 0px",
              }}
            >
              Ingresar
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default FormLogin;
