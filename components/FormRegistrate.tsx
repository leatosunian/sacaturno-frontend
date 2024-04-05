"use client";
import { FormEventHandler, useState, useEffect } from "react";
import styles from "../app/css-modules/login.module.css";
import axiosReq from "@/config/axios";
import AlertInterface from "@/interfaces/alert.interface";
import { IUser } from "@/interfaces/user.interface";
import { registerSchema } from "@/app/schemas/registerSchema";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import Link from "next/link";
import FormAlert from "./FormAlert";

interface formInputs {
  name: string;
  password: string;
  phone: number;
  email: string;
}

const FormRegistrate = () => {
  const [alert, setAlert] = useState<AlertInterface>({ error: false, alertType: "OK_ALERT", msg: "El usuario ya existe" });
  const [registerData, setRegisterData] = useState<IUser>();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<formInputs>({
    resolver: zodResolver(registerSchema),
  });

  const hideAlert = () => {
    setTimeout(() => {
      setAlert({ error: false, alertType: "ERROR_ALERT", msg: "" });
    }, 3000);
  };

  /*useEffect(() => {
    hideAlert()
  }, [])*/
  

  const handleRegister = async (data: FieldValues) => {
    if (data) {
      const registeredUser = await axiosReq.post("/user/create", data);
      console.log(registeredUser);
      if (registeredUser.data.response_data === "USER_EXISTS") {
        setAlert({
          alertType: "ERROR_ALERT",
          error: true,
          msg: "El usuario ya existe",
        });
        hideAlert();
      }
      if (
        registeredUser.data.response_data.msg === "CHAT_CREATED_SUCCESSFULLY"
      ) {
        setAlert({
          alertType: "OK_ALERT",
          error: true,
          msg: "¡Usuario creado! Iniciá sesión y comenzá a crear tu empresa.",
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
          <span className="text-sm">Nombre</span>
          <input type="text" {...register("name")} />
          {errors.name?.message && (
            <>
              <div className="flex items-center justify-center gap-1 w-fit h-fit">
                <AiOutlineExclamationCircle color="red" />
                <span className="text-xs "> {errors.name.message} </span>
              </div>
            </>
          )}
        </div>

        <div className={styles.loginFormInput}>
          <span className="text-sm">Correo electrónico</span>
          <input type="email" {...register("email")} />
          {errors.email?.message && (
            <>
              <div className="flex items-center justify-center gap-1 w-fit h-fit">
                <AiOutlineExclamationCircle color="red" />
                <span className="text-xs "> {errors.email.message} </span>
              </div>
            </>
          )}
        </div>

        <div className={styles.loginFormInput}>
          <span className="text-sm">Teléfono</span>
          <input type="number" {...register("phone")} />
          {errors.phone?.message && (
            <>
              <div className="flex items-center justify-center gap-1 w-fit h-fit">
                <AiOutlineExclamationCircle color="red" />
                <span className="text-xs "> {errors.phone.message} </span>
              </div>
            </>
          )}
        </div>

        <div className={styles.loginFormInput}>
          <span className="text-sm">Contraseña</span>
          <input type="password" {...register("password")} />
          {errors.password?.message && (
            <>
              <div className="flex items-center justify-center gap-1 w-fit h-fit">
                <AiOutlineExclamationCircle color="red" />
                <span className="text-xs "> {errors.password.message} </span>
              </div>
            </>
          )}
        </div>

        {alert && (
          <FormAlert
            msg={alert.msg}
            error={alert.error}
            alertType={alert.alertType}
          />
        )}

        <span className="text-xs ">
          Ya tenes cuenta? Hacé click para
          <b className="cursor-pointer">
            <Link href="/login"> iniciar sesión</Link>
          </b>
        </span>
        <button type="submit" className={styles.translucentBtn}>
          Crear cuenta
        </button>
      </form>
    </>
  );
};

export default FormRegistrate;
