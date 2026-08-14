"use client";
import { useEffect, useState } from "react";
import stylesHome from "@/app/css-modules/HomeWhite.module.css";
import axios from "axios";
import axiosReq from "@/config/axios";
import AlertInterface from "@/interfaces/alert.interface";
import { registerSchema } from "@/app/schemas/registerSchema";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import Link from "next/link";
import FormAlert from "../../FormAlert";
import AccountCreatedModal from "./AccountCreatedModal";

interface formInputs {
  name: string;
  surname: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  email: string;
  acceptPolicy: boolean;
}

interface FormRegistrateProps {
  // true cuando el registro con Google está procesando: bloquea el submit por credenciales.
  disabled?: boolean;
  // Reporta al contenedor si este formulario está procesando.
  onLoadingChange?: (loading: boolean) => void;
}

const FormRegistrate = ({
  disabled = false,
  onLoadingChange,
}: FormRegistrateProps) => {
  const [alert, setAlert] = useState<AlertInterface>({
    error: false,
    alertType: "OK_ALERT",
    msg: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [isPolicyAccepted, setIsPolicyAccepted] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formInputs>({
    resolver: zodResolver(registerSchema),
  });

  const hideAlert = () => {
    setTimeout(() => {
      setAlert({ error: false, alertType: "ERROR_ALERT", msg: "" });
    }, 6000);
  };

  const handleRegister = async (data: FieldValues) => {
    if (disabled) return;
    if (!isPolicyAccepted) {
      setAlert({
        alertType: "ERROR_ALERT",
        error: true,
        msg: "Debes aceptar los terminos y condiciones",
      });
      hideAlert();
      return;
    }
    if (data) {
      setAlert({ error: false, alertType: "ERROR_ALERT", msg: "" });
      setLoading(true);
      try {
        const registeredUser = await axiosReq.post("/user/create", data);
        if (registeredUser.data.response_data === "USER_EXISTS") {
          setAlert({
            alertType: "ERROR_ALERT",
            error: true,
            msg: "El correo electrónico ya está registrado",
          });
          hideAlert();
          setLoading(false);
        }
        if (registeredUser.data.response_data === "PHONE_EXISTS") {
          setAlert({
            alertType: "ERROR_ALERT",
            error: true,
            msg: "El número de teléfono ya está registrado",
          });
          hideAlert();
          setLoading(false);
        }
        if (registeredUser.data.response_data === "INVALID_EMAIL") {
          setAlert({
            alertType: "ERROR_ALERT",
            error: true,
            msg: "El formato del correo electrónico no es válido",
          });
          hideAlert();
          setLoading(false);
        }
        if (
          registeredUser.data.response_data.msg === "USER_CREATED_SUCCESSFULLY"
        ) {
          setLoading(false);
          setRegisteredEmail(data.email);
          setShowSuccessModal(true);
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
        setAlert({
          alertType: "ERROR_ALERT",
          error: true,
          msg:
            axios.isAxiosError(error) && error.response?.status === 429
              ? "Demasiadas cuentas creadas desde esta conexión. Probá de nuevo en una hora."
              : "Error al crear cuenta",
        });
        hideAlert();
      }
    }
  };

  return (
    <>
      {showSuccessModal && <AccountCreatedModal email={registeredEmail} />}

      <form
        onSubmit={handleSubmit((data) => {
          handleRegister(data);
        })}
        className="w-full flex flex-col gap-5 max-[1535px]:gap-3"
      >
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="text-[12px] font-medium uppercase truncate">
              Nombre
            </span>
            <input
              type="text"
              {...register("name")}
              placeholder="Tu nombre"
              className="h-[33px] sm:h-[26px] lg:h-[28px] 2xl:h-[30px] w-full border border-black/10 rounded-[7px] bg-black/5 text-[12px] sm:text-[11px] lg:text-[12px] 2xl:text-[13px] px-2.5 transition-all ease-in-out duration-200 cursor-pointer hover:border-[#dd4924] focus:bg-black/[0.08] focus:border-[#dd4924] focus:outline-none"
            />
            {errors.name?.message && (
              <div className="flex items-center gap-1 mt-1 w-fit h-fit">
                <AiOutlineExclamationCircle color="red" />
                <span className="text-xs">{errors.name.message}</span>
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="text-[12px] font-medium uppercase truncate">
              Apellido
            </span>
            <input
              type="text"
              {...register("surname")}
              placeholder="Tu apellido"
              className="h-[33px] sm:h-[26px] lg:h-[28px] 2xl:h-[30px] w-full border border-black/10 rounded-[7px] bg-black/5 text-[12px] sm:text-[11px] lg:text-[12px] 2xl:text-[13px] px-2.5 transition-all ease-in-out duration-200 cursor-pointer hover:border-[#dd4924] focus:bg-black/[0.08] focus:border-[#dd4924] focus:outline-none"
            />
            {errors.surname?.message && (
              <div className="flex items-center gap-1 mt-1 w-fit h-fit">
                <AiOutlineExclamationCircle color="red" />
                <span className="text-xs">{errors.surname.message}</span>
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex flex-col gap-0.5">
          <span className="text-[12px] font-medium uppercase truncate">
            Correo electrónico
          </span>
          <input
            type="email"
            {...register("email")}
            placeholder="Ingresá tu email"
            className="h-[33px] sm:h-[26px] lg:h-[28px] 2xl:h-[30px] w-full border border-black/10 rounded-[7px] bg-black/5 text-[12px] sm:text-[11px] lg:text-[12px] 2xl:text-[13px] px-2.5 transition-all ease-in-out duration-200 cursor-pointer hover:border-[#dd4924] focus:bg-black/[0.08] focus:border-[#dd4924] focus:outline-none"
          />
          {errors.email?.message && (
            <div className="flex items-center gap-1 mt-1 w-fit h-fit">
              <AiOutlineExclamationCircle color="red" />
              <span className="text-xs">{errors.email.message}</span>
            </div>
          )}
        </div>

        <div className="w-full flex flex-row gap-3">
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span className="text-[12px] font-medium uppercase truncate">
              Contraseña
            </span>
            <input
              type="password"
              {...register("password")}
              placeholder="Ingresá tu contraseña"
              className="h-[33px] sm:h-[26px] lg:h-[28px] 2xl:h-[30px] w-full border border-black/10 rounded-[7px] bg-black/5 text-[12px] sm:text-[11px] lg:text-[12px] 2xl:text-[13px] px-2.5 transition-all ease-in-out duration-200 cursor-pointer hover:border-[#dd4924] focus:bg-black/[0.08] focus:border-[#dd4924] focus:outline-none"
            />
            {errors.password?.message && (
              <div className="flex items-center gap-1 mt-1 w-fit h-fit">
                <AiOutlineExclamationCircle color="red" />
                <span className="text-xs">{errors.password.message}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span className="text-[12px] font-medium uppercase truncate">
              Confirmar contraseña
            </span>
            <input
              type="password"
              {...register("confirmPassword")}
              placeholder="Repetí tu contraseña"
              className="h-[33px] sm:h-[26px] lg:h-[28px] 2xl:h-[30px] w-full border border-black/10 rounded-[7px] bg-black/5 text-[12px] sm:text-[11px] lg:text-[12px] 2xl:text-[13px] px-2.5 transition-all ease-in-out duration-200 cursor-pointer hover:border-[#dd4924] focus:bg-black/[0.08] focus:border-[#dd4924] focus:outline-none"
            />
            {errors.confirmPassword?.message && (
              <div className="flex items-center gap-1 mt-1 w-fit h-fit">
                <AiOutlineExclamationCircle color="red" />
                <span className="text-xs">
                  {errors.confirmPassword.message}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 md:mt-2 md:gap-3">
          <label className="container">
            <input
              type="checkbox"
              onClick={() => setIsPolicyAccepted(!isPolicyAccepted)}
            />
            <svg viewBox="0 0 64 64" height="15px" width="15px">
              <path
                d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16"
                pathLength="575.0541381835938"
                className="path"
              ></path>
            </svg>
          </label>
          <span className="text-xs">
            Acepto los{" "}
            <Link
              className="text-xs font-semibold blackOrangeHover"
              href="/faq/terminos"
            >
              términos y condiciones
            </Link>
          </span>
          {errors.acceptPolicy?.message && (
            <div className="flex items-center gap-1 mt-1 w-fit h-fit">
              <AiOutlineExclamationCircle color="red" />
              <span className="text-xs">{errors.acceptPolicy.message}</span>
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

        <div className="flex items-center justify-center w-full mt-2 h-fit">
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
              disabled={showSuccessModal || disabled}
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
              Crear cuenta
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default FormRegistrate;
