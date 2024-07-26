"use client";
import { useEffect, useState } from "react";
import styles from "../app/css-modules/FormLogin.module.css";
import stylesHome from "../app/css-modules/HomeWhite.module.css";
import axiosReq from "@/config/axios";
import AlertInterface from "@/interfaces/alert.interface";
import Link from "next/link";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormAlert from "../../FormAlert";
import { newPasswordRecoverySchema } from "@/app/schemas/newPasswordRecoverySchema";

interface formInputs {
  password: string;
  confirmPassword: string;
}

interface IProps {
  token: string;
}

const NewPasswordRecovery: React.FC<IProps> = ({ token }) => {
  const [alert, setAlert] = useState<AlertInterface>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formInputs>({
    resolver: zodResolver(newPasswordRecoverySchema),
  });

  const hideAlert = () => {
    setTimeout(() => {
      setAlert({ error: false, alertType: "ERROR_ALERT", msg: "" });
    }, 6000);
  };

  useEffect(() => {
    return () => {
      setAlert({ error: false, alertType: "ERROR_ALERT", msg: "" });
    };
  }, []);

  const handleSetNewPassword = async (data: FieldValues) => {
    if (data) {
      if (data.password !== data.confirmPassword) {
        setAlert({
          alertType: "ERROR_ALERT",
          error: true,
          msg: "Las contraseñas no coinciden.",
        });
        return;
      }
      try {
        const recovery = await axiosReq.post(
          `/user/password/recovery/set/${token}`,
          data
        );
        console.log(recovery);
        setAlert({
          alertType: "OK_ALERT",
          error: true,
          msg: "¡Tu contraseña fue cambiada con éxito! Ya podés iniciar sesión con tus nuevos datos.",
        });
      } catch (error) {
        setAlert({
          alertType: "ERROR_ALERT",
          error: true,
          msg: "Ocurrió un error al reestablecer tu contraseña. Intentá nuevamente.",
        });
        hideAlert()
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
          handleSetNewPassword(data);
        })}
        className={styles.loginForm}
      >
        <div className={styles.loginFormInput}>
          <span style={{ fontSize: "12px" }} className="font-medium uppercase ">
            Nueva contraseña
          </span>
          <input type="password" {...register("password")} placeholder="Ingresá tu nueva contraseña" />
          {errors.password?.message && (
            <>
              <div className="flex items-center justify-center gap-1 mt-1 w-fit h-fit">
                <AiOutlineExclamationCircle color="red" />
                <span className="text-xs "> {errors.password.message} </span>
              </div>
            </>
          )}
        </div>

        <div className={styles.loginFormInput}>
          <span style={{ fontSize: "12px" }} className="font-medium uppercase ">
            Confirmar contraseña
          </span>
          <input type="password" {...register("confirmPassword")} placeholder="Confirmá tu nueva contraseña" />
          {errors.confirmPassword?.message && (
            <>
              <div className="flex items-center justify-center gap-1 mt-1 w-fit h-fit">
                <AiOutlineExclamationCircle color="red" />
                <span className="text-xs ">
                  {errors.confirmPassword.message}
                </span>
              </div>
            </>
          )}
        </div>

        <span className="text-xs ">
          Volver a
          <b className="cursor-pointer">
            <Link href="/login"> iniciar sesión</Link>
          </b>
        </span>
        {alert && (
          <FormAlert
            msg={alert.msg}
            error={alert.error}
            alertType={alert.alertType}
          />
        )}

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
          Cambiar contraseña
        </button>
      </form>
    </>
  );
};

export default NewPasswordRecovery;
