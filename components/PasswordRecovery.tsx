"use client";
import { FormEventHandler, useState, useEffect } from "react";
import styles from "../app/css-modules/FormLogin.module.css";
import axiosReq from "@/config/axios";
import AlertInterface from "@/interfaces/alert.interface";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/app/schemas/loginSchema";
import FormAlert from "./FormAlert";

interface formInputs {
  password: string;
  email: string;
}

const PasswordRecovery = () => {
  const [alert, setAlert] = useState<AlertInterface>();

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

  const handlePasswordRecovery = async (data: FieldValues) => {
    if (data) {
      const login = await axiosReq.post(`/user/login`, data);

      console.log("login: ", login);

    }
  };

  /*const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };*/

  return (
    <>
      <form
        onSubmit={handleSubmit((data) => {
          handlePasswordRecovery(data);
        })}
        className={styles.loginForm}
      >
        <div className={styles.loginFormInput}>
          <span style={{ fontSize: "12px" }} className="font-medium uppercase ">
            Correo electrónico
          </span>
          <input type="email" {...register("email")} />
          {errors.email?.message && (
            <>
              <div className="flex items-center justify-center gap-1 mt-1 w-fit h-fit">
                <AiOutlineExclamationCircle color="red" />
                <span className="text-xs "> {errors.email.message} </span>
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
            Volver a
          <b className="cursor-pointer">
            <Link href="/register"> iniciar sesión</Link>
          </b>
        </span>
        <button type="submit" className={styles.translucentBtn}>
          Recuperar contraseña
        </button>
      </form>
    </>
  );
};

export default PasswordRecovery;
