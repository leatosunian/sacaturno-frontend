"use client";
import { useState } from "react";
import stylesHome from "@/app/css-modules/HomeWhite.module.css";
import axiosReq from "@/config/axios";
import AlertInterface from "@/interfaces/alert.interface";
import Link from "next/link";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordRecoverySchema } from "@/app/schemas/passwordRecoverySchema";
import FormAlert from "@/components/FormAlert";

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
      try {
        const userData = await axiosReq.get(
          "/user/getbyemail/" + data.email
        );
        if (userData.data.response_data === "USER_NOT_FOUND") {
          setAlert({
            alertType: "ERROR_ALERT",
            error: true,
            msg: "No existe una cuenta con ese correo.",
          });
          setLoading(false);
          return;
        }
        await axiosReq.post(
          `/user/password/recovery/${userData.data.response_data._id}`
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

  return (
    <>
      <form
        onSubmit={handleSubmit((data) => {
          handlePasswordRecovery(data);
        })}
        className="w-full flex flex-col gap-5 max-[1535px]:gap-[14px]"
      >
        <div className="w-full flex flex-col gap-0.5">
          <span className="text-[12px] font-medium uppercase">
            Correo electrónico
          </span>
          <input
            type="email"
            {...register("email")}
            placeholder="Ingresá tu email"
            className="h-[30px] max-[1535px]:h-[26px] w-full border border-black/10 rounded-[7px] bg-black/5 text-[13px] max-[1535px]:text-[11px] px-2.5 transition-all ease-in-out duration-200 cursor-pointer hover:border-[#dd4924] focus:bg-black/[0.08] focus:border-[#dd4924] focus:outline-none"
          />
          {errors.email?.message && (
            <div className="flex items-center gap-1 mt-1 w-fit h-fit">
              <AiOutlineExclamationCircle color="red" />
              <span className="text-xs">{errors.email.message}</span>
            </div>
          )}
        </div>

        {alert && (
          <FormAlert
            msg={alert.msg}
            error={alert.error}
            alertType={alert.alertType}
          />
        )}

        <button
          type="submit"
          className={`${stylesHome.btnAnimated} rounded-lg mt-3`}
          style={{
            fontSize: "13px",
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
