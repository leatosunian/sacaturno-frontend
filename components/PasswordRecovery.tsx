"use client";
import { useState } from "react";
import styles from "../app/css-modules/FormLogin.module.css";
import stylesHome from "../app/css-modules/HomeWhite.module.css";
import axiosReq from "@/config/axios";
import AlertInterface from "@/interfaces/alert.interface";
import Link from "next/link";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormAlert from "./FormAlert";
import { passwordRecoverySchema } from "@/app/schemas/passwordRecoverySchema";

interface formInputs {
  email: string;
}

const PasswordRecovery = () => {
  const [alert, setAlert] = useState<AlertInterface>();
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formInputs>({
    resolver: zodResolver(passwordRecoverySchema),
  });

  const hideAlert = () => {
    setTimeout(() => {
      setAlert({ error: false, alertType: "ERROR_ALERT", msg: "" });
    }, 10000);
  };

  const handlePasswordRecovery = async (data: FieldValues) => {
    if (data) {
      setLoading(true);
      // GET BUSINESS BY EMAIL
      try {
        const businessData = await axiosReq.get(
          "/business/getbyemail/" + data.email
        );
        if (businessData.data === "BUSINESS_NOT_FOUND") {
          setAlert({
            alertType: "ERROR_ALERT",
            error: true,
            msg: "No existe una cuenta con ese correo.",
          });
          setLoading(false);
          return;
        }
        // SEND RECOVERY EMAIL
        const recovery = await axiosReq.post(
          `/user/password/recovery/${businessData.data.ownerID}`
        );
        setLoading(false);
        setAlert({
          alertType: "OK_ALERT",
          error: true,
          msg: "Te enviamos un correo para restablecer tu contraseña. Revisá tu casilla de correo no deseado.",
        });
        hideAlert();
      } catch (error) {
        setAlert({
          alertType: "ERROR_ALERT",
          error: true,
          msg: "Error al enviar correo. Intentá nuevamente.",
        });
        hideAlert();
        setLoading(false);
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
          handlePasswordRecovery(data);
        })}
        className={styles.loginForm}
      >
        <div className={styles.loginFormInput}>
          <span style={{ fontSize: "12px" }} className="font-medium uppercase ">
            Correo electrónico
          </span>
          <input type="email" {...register("email")} placeholder="Ingresá tu email" />
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
          <b className="cursor-pointer blackOrangeHover">
            <Link href="/login"> iniciar sesión</Link>
          </b>
        </span>
        <button
          type="submit"
          className={`${stylesHome.btnAnimated} mt-3`}
          style={{
            fontSize: "12px",
            letterSpacing: ".5px",
            width: "100%",
            padding: "11px 0px",
          }}
        >
          Recuperar contraseña
        </button>
      </form>
    </>
  );
};

export default PasswordRecovery;
