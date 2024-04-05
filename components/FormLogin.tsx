"use client";
import { FormEventHandler, useState, useEffect } from "react";
import styles from "../app/css-modules/login.module.css";
import axiosReq from "@/config/axios";
import AlertInterface from "@/interfaces/alert.interface";
import Alert from "./Alert";
import { redirect } from "next/navigation";
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

const FormLogin = () => {
  const [alert, setAlert] = useState<AlertInterface>();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<formInputs>({
    resolver: zodResolver(loginSchema),
  });

  const { saveAuthData } = useAuth();
  const router = useRouter();
  const hideAlert = () => {
    setTimeout(() => {
      setAlert({ error: false, alertType: "ERROR_ALERT", msg: "" });
    }, 3000);
  };

  const handleLogin = async (data: FieldValues) => {
    if (data) {
      const login = await axiosReq.post(`/user/login`, data);
      console.log(login);

      if (typeof login.data.response_data === "object") {
        localStorage.setItem(
          "sacaturno_userID",
          login.data.response_data.userID
        );
        localStorage.setItem("sacaturno_token", login.data.response_data.token);

        try {
          const res = await fetch( '/api/login', {
            method: "POST",
            body: JSON.stringify({
              token: login.data.response_data.token,
              userID: login.data.response_data.userID,
            }),
            headers: {
              "content-type": "application/json",
            },
          });
          console.log(res);
          const loginData = {
            userID: login.data.response_data.userID,
            token: login.data.response_data.token,
          };
          localStorage.setItem("sacaturno_userID", loginData.userID);
          localStorage.setItem("sacaturno_token", loginData.token);
          saveAuthData(loginData);
        } catch (error) {
          return setAlert({
            alertType: "ERROR_ALERT",
            error: true,
            msg: "Error al iniciar sesión",
          });
        }

        setAlert({ alertType: "ERROR_ALERT", error: false, msg: "" });
        hideAlert();
        router.push("/admin/perfil");
        return;
      }
      if (login.data.response_data === "WRONG_PASSWORD" || "USER_NOT_FOUND") {
        setAlert({
          alertType: "ERROR_ALERT",
          error: true,
          msg: "Usuario o contraseña incorrectos",
        });
        hideAlert();
        return;
      }
    }
  };

  /*const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };*/

  return (
    <>
      <form
        onSubmit={handleSubmit((data) => {
          handleLogin(data);
        })}
        className={styles.loginForm}
      >
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
          No tenes cuenta? Hacé click para
          <b className="cursor-pointer">
            <Link href="/register"> registrarte</Link>
          </b>
        </span>
        <button type="submit" className={styles.translucentBtn}>
          Ingresar
        </button>
      </form>
    </>
  );
};

export default FormLogin;
