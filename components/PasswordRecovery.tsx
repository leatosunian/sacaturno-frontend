"use client";
import { useState } from "react";
import styles from "../app/css-modules/FormLogin.module.css";
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
      // GET BUSINESS BY EMAIL 
      const businessData = await axiosReq.get('/business/getbyemail/'+data.email)
      if(businessData.data === 'BUSINESS_NOT_FOUND'){
        setAlert({ alertType: "ERROR_ALERT", error: true, msg: "No existe una cuenta con ese correo."});
        return
      }      
      // SEND RECOVERY EMAIL
      const recovery = await axiosReq.post(`/user/password/recovery/${businessData.data.ownerID}`);
      console.log(recovery);
      setAlert({ alertType: "OK_ALERT", error: true, msg: "Te enviamos un correo para restablecer tu contraseña. Revisá tu casilla de correo no deseado."});
      hideAlert()
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
            <Link href="/login"> iniciar sesión</Link>
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
