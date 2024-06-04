"use client";
import { useEffect, useState } from "react";
import styles from "../app/css-modules/FormLogin.module.css";
import axiosReq from "@/config/axios";
import AlertInterface from "@/interfaces/alert.interface";
import Link from "next/link";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormAlert from "./FormAlert";
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
  console.log(token)
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
    }
  }, [])
  

  const handleSetNewPassword = async (data: FieldValues) => {
    console.log('Form inputs', data );
    
    if (data) {
      if(data.password !== data.confirmPassword){
        setAlert({
          alertType: "ERROR_ALERT",
          error: true,
          msg: "Las contraseñas no coinciden.",
        });
        return
      }
      const recovery = await axiosReq.post(`/user/password/recovery/set/${token}`, data);
      console.log(recovery)
      setAlert({
        alertType: "OK_ALERT",
        error: true,
        msg: "¡Tu contraseña fue cambiada con éxito! Ya podés iniciar sesión con tus nuevos datos.",
      });
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
          <input type="password" {...register("password")} />
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
          <input type="password" {...register("confirmPassword")} />
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
            <Link href="/login"> iniciar sesión</Link>
          </b>
        </span>
        <button type="submit" className={styles.translucentBtn}>
          Cambiar contraseña
        </button>
        
      </form>
    </>
  );
};

export default NewPasswordRecovery;
