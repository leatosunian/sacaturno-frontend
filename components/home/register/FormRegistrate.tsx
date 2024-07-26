"use client";
import { useState } from "react";
import styles from "@/app/css-modules/FormRegistrate.module.css";
import stylesHome from "@/app/css-modules/HomeWhite.module.css";
import axiosReq from "@/config/axios";
import AlertInterface from "@/interfaces/alert.interface";
import { registerSchema } from "@/app/schemas/registerSchema";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import Link from "next/link";
import FormAlert from "../../FormAlert";

interface formInputs {
  name: string;
  password: string;
  phone: number;
  email: string;
  acceptPolicy: boolean
}

const FormRegistrate = () => {
  const [alert, setAlert] = useState<AlertInterface>({
    error: false,
    alertType: "OK_ALERT",
    msg: "El usuario ya existe",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [isPolicyAccepted, setIsPolicyAccepted] = useState<boolean>(false)
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
    if(!isPolicyAccepted){
      setAlert({
        alertType: "ERROR_ALERT",
        error: true,
        msg: "Debes aceptar los terminos y condiciones",
      });
      hideAlert()
      return
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
            msg: "El usuario ya existe",
          });
          hideAlert();
          setLoading(false);
        }
        if (
          registeredUser.data.response_data.msg === "USER_CREATED_SUCCESSFULLY"
        ) {
          setAlert({
            alertType: "OK_ALERT",
            error: true,
            msg: "¡Usuario creado! Revisá tu correo y activá tu cuenta. Si no recibiste el correo, revisá tu correo no deseado.",
          });
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
        setAlert({
          alertType: "ERROR_ALERT",
          error: true,
          msg: "Error al crear cuenta",
        });
        hideAlert();
      }
    }
  };

  /*const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };*/

  return (
    <>
      <form
        onSubmit={handleSubmit((data) => {
          handleRegister(data);
        })}
        className={styles.loginForm}
      >
        <div className={styles.loginFormInput}>
          <span style={{ fontSize: "12px" }} className="font-medium uppercase ">
            Nombre completo
          </span>
          <input
            type="text"
            {...register("name")}
            placeholder="Ingresá tu nombre y apellido"
          />
          {errors.name?.message && (
            <>
              <div className="flex items-center justify-center gap-1 mt-1 w-fit h-fit">
                <AiOutlineExclamationCircle color="red" />
                <span className="text-xs "> {errors.name.message} </span>
              </div>
            </>
          )}
        </div>

        <div className={styles.loginFormInput}>
          <span style={{ fontSize: "12px" }} className="font-medium uppercase ">
            Correo electrónico
          </span>
          <input
            type="email"
            {...register("email")}
            placeholder="Ingresá tu email"
          />
          {errors.email?.message && (
            <>
              <div className="flex items-center justify-center gap-1 mt-1 w-fit h-fit">
                <AiOutlineExclamationCircle color="red" />
                <span className="text-xs "> {errors.email.message} </span>
              </div>
            </>
          )}
        </div>

        <div className={styles.loginFormInput}>
          <span style={{ fontSize: "12px" }} className="font-medium uppercase ">
            Contraseña
          </span>
          <input
            type="password"
            {...register("password")}
            placeholder="Ingresá tu contraseña"
          />
          {errors.password?.message && (
            <>
              <div className="flex items-center justify-center gap-1 mt-1 w-fit h-fit">
                <AiOutlineExclamationCircle color="red" />
                <span className="text-xs "> {errors.password.message} </span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3 md:mt-2 md:gap-3">
          <label className="container">
            <input type="checkbox" onClick={() => setIsPolicyAccepted(!isPolicyAccepted)} />
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
            <Link className="text-xs font-semibold blackOrangeHover" href={"/faq/terminos"}>
              términos y condiciones
            </Link>
          </span>
          {errors.acceptPolicy?.message && (
            <>
              <div className="flex items-center justify-center gap-1 mt-1 w-fit h-fit">
                <AiOutlineExclamationCircle color="red" />
                <span className="text-xs "> {errors.acceptPolicy.message} </span>
              </div>
            </>
          )}
        </div>

        {alert.error !== false && (
          <FormAlert
            msg={alert.msg}
            error={alert.error}
            alertType={alert.alertType}
          />
        )}

        <span className="mt-2 text-xs md:mt-0 ">
          Ya tenes cuenta? Hacé click para
          <b className="cursor-pointer blackOrangeHover">
            <Link href="/login"> iniciar sesión</Link>
          </b>
        </span>
        <div className="flex items-center justify-center w-full mt-3 h-fit">
          {loading && (
            <>
              <div
                style={{ height: "100%", width: "100%" }}
                className="flex items-center justify-center w-full"
              >
                <div className="loaderSmall"></div>
              </div>
            </>
          )}
          {!loading && (
            <button
              type="submit"
              className={`${stylesHome.btnAnimated}`}
              style={{
                fontSize: "12px",
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

export default FormRegistrate;
