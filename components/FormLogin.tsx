"use client";
import { useState } from "react";
import styles from "../app/css-modules/FormLogin.module.css";
import stylesHome from "../app/css-modules/HomeWhite.module.css";
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

const FormLogin = () => {
  const [alert, setAlert] = useState<AlertInterface>({
    alertType: "ERROR_ALERT",
    error: false,
    msg: "",
  });
  const [loading, setLoading] = useState<boolean>(false);

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
    if (data) {
      setLoading(true);
      try {
        const login = await axiosReq.post(`/user/login`, data);

        if (typeof login.data.response_data === "object") {
          localStorage.setItem(
            "sacaturno_userID",
            login.data.response_data.userID
          );
          localStorage.setItem(
            "sacaturno_token",
            login.data.response_data.token
          );

          try {
            const res = await fetch("/api/login", {
              method: "POST",
              body: JSON.stringify({
                token: login.data.response_data.token,
                userID: login.data.response_data.userID,
              }),
              headers: {
                "content-type": "application/json",
              },
            });
            const loginData = {
              userID: login.data.response_data.userID,
              token: login.data.response_data.token,
            };
            localStorage.setItem("sacaturno_userID", loginData.userID);
            localStorage.setItem("sacaturno_token", loginData.token);
            saveAuthData(loginData);
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
          router.push("/admin/dashboard");
          router.refresh();
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
        if (login.data.response_data === "WRONG_PASSWORD" || "USER_NOT_FOUND") {
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

        {alert.error !== false && (
          <FormAlert
            msg={alert.msg}
            error={alert.error}
            alertType={alert.alertType}
          />
        )}

        <div className="flex flex-col gap-2 my-2 md:gap-0 w-fit h-fit">
          <span className="mb-3 text-xs font-light">
            ¿No tenes cuenta?{"  "}
            <Link
              className="font-semibold cursor-pointer blackOrangeHover"
              href="/register"
            >
              Registrate
            </Link>
          </span>
          <span className="text-xs font-light">
            ¿Olvidaste tu contraseña?
            {"  "}
            <Link
              className="font-semibold cursor-pointer blackOrangeHover"
              href="/login/recovery"
            >
              Recuperar contraseña
            </Link>
          </span>
        </div>

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

export default FormLogin;
