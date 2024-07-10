"use client";
import { IUser } from "@/interfaces/user.interface";
import React, { useEffect, useState } from "react";
import { BsFillCheckCircleFill } from "react-icons/bs";
import styles from "@/app/css-modules/FormMiEmpresa.module.css";
import Link from "next/link";
import { TiDelete } from "react-icons/ti";

type Props = {
  userData: IUser;
};

const UserVerificationComponent = ({ userData }: Props) => {
  const [isUser, setIsUser] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false)
    if (userData === undefined) {
      return setIsUser(false);
    }
    if (userData._id) {
      return setIsUser(true);
    }
  }, [userData]);

  return (
    <>
      {loading && (
        <>
          <div
            style={{ height: "calc(100vh - 64px)" }}
            className="flex items-center justify-center w-full bg-white"
          >
            <div className="loader"></div>
          </div>
        </>
      )}

      {!loading && (
        <>
          <div className="flex flex-col items-center w-5/6 gap-16 md:w-1/2 lg:w-2/5">
            {isUser && (
              <>
                <div className="flex flex-col items-center gap-4">
                  <BsFillCheckCircleFill size={80} color="#4bc720" />
                  <h4 className="text-2xl font-bold text-center uppercase ">
                    Activaste tu cuenta
                  </h4>
                </div>
                <div className="flex flex-col gap-5">
                  <p className="font-medium text-justify text-md md:text-lg">
                    ¡Gracias <b>{userData?.name}</b> por registrarte en
                    SacaTurno! <b>Ya podés iniciar sesión</b> y comenzar a
                    configurar tu empresa y <b>cargar tus turnos</b>.{" "}
                  </p>
                  <p className="font-medium text-md md:text-lg">
                    &#128276; Te recordamos que ya dispones de un{" "}
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
              </>
            )}

            {!isUser && (
              <>
                <div className="flex flex-col items-center gap-4">
                  <TiDelete size={80} color="red" />
                  <h4 className="text-2xl font-bold text-center uppercase ">
                    Error al activar tu cuenta
                  </h4>
                </div>
                <div className="flex flex-col gap-5">
                  <p className="font-medium text-justify text-md md:text-lg">
                    No se pudo activar tu cuenta. O tu cuenta ya fue activada u
                    ocurrió un error durante la verificación.
                  </p>
                  <p className="font-medium text-sm md:text-base">
                    &#128161; Si estas teniendo problemas activando tu cuenta,
                    no dudes en{" "}
                    <Link
                      href={"mailto:leandrotosunian@hotmail.com"}
                      target="_blank"
                      className="font-bold cursor-pointer"
                    >
                      contactarnos.
                    </Link>
                  </p>
                </div>
                <Link
                  href={"/login"}
                  className={styles.button}
                  style={{ padding: "12px 20px", fontSize: "14px" }}
                >
                  iniciar sesión
                </Link>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};
export default UserVerificationComponent;
