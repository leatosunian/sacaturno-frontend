"use client";
import { IUser } from "@/interfaces/user.interface";
import React from "react";
import { BsFillCheckCircleFill } from "react-icons/bs";
import styles from "@/app/css-modules/FormMiEmpresa.module.css";
import { PiWarningCircleFill } from "react-icons/pi";
import Link from "next/link";
type Props = {
  userData: IUser;
};

const UserVerificationComponent = ({ userData }: Props) => {
  return (
    <>
      <div className="flex flex-col items-center w-5/6 gap-16 md:w-1/2 lg:w-2/5">
        <div className="flex flex-col items-center gap-4">
          <BsFillCheckCircleFill size={80} color="#4bc720" />
          <h4 className="text-2xl font-bold text-center uppercase ">
            Activaste tu cuenta
          </h4>
        </div>
        <div className="flex flex-col gap-5">
          <p className="font-medium text-justify text-md md:text-lg">
            ¡Gracias <b>{userData.name}</b> por registrarte en SacaTurno!{" "}
            <b>Ya podés iniciar sesión</b> y comenzar a configurar tu empresa y{" "}
            <b>cargar tus turnos</b>.{" "}
          </p>
          <p className="font-medium text-md md:text-lg">
            &#128276;  Te recordamos que ya dispones de un{" "}
            <b>período de prueba gratuito</b> de un mes.
          </p>
        </div>
        <Link
          href={"/login"}
          className={styles.button}
          style={{ padding: "12px 20px", fontSize: "14px" }}
        >
          iniciar sesión
        </Link>
      </div>
    </>
  );
};
export default UserVerificationComponent;
