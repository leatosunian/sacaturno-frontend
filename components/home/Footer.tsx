import Link from "next/link";
import React from "react";
import styles from "@/app/css-modules/HomeWhite.module.css";
import Image from "next/image";
import logo from "@/public/st_logo_white.png";
const Footer: React.FC = () => {
  return (
    <>
      <div className="w-full h-fit">
        <div className={styles.footerContainer}>
          <div className="flex flex-col justify-between w-full h-full gap-12 px-4 py-12 sm:flex-row md:px-20 sm:px-12 lg:px-32 xl:px-52 md:gap-0">
            <div className="flex flex-col items-center justify-center h-full mx-auto md:mx-0 w-fit">
              <Image
                className="hidden md:block"
                src={logo}
                alt={"Logo"}
                width={300}
              />
              <Image
                className="block md:hidden"
                src={logo}
                alt={"Logo"}
                width={200}
              />
              <span className="mt-2 text-xs font-thin text-gray-200">
                tu app para gestionar tu agenda
              </span>
            </div>

            <div className="flex justify-center w-full gap-20 text-white md:justify-end md:gap-28 ">
              <div className="flex flex-col gap-4 lg:gap-3 w-fit h-fit">
                <span className="text-sm font-semibold uppercase">
                  Nuestro servicio
                </span>
                <div className="flex flex-col gap-2 lg:gap-1">
                  <Link href={''} className={`${styles.textHoverToOrange} text-xs`}>
                    Preguntas frecuentes
                  </Link>
                  <Link href={''} className={`${styles.textHoverToOrange} text-xs`}>
                    Guía de uso
                  </Link>
                  <Link href={''} className={`${styles.textHoverToOrange} text-xs`}>
                    Contactanos
                  </Link>
                </div>
              </div>
              <div className="flex flex-col gap-4 lg:gap-3 w-fit h-fit">
                <span className="text-sm font-semibold uppercase">
                  Tu cuenta
                </span>
                <div className="flex flex-col gap-2 lg:gap-1">
                  <Link href={''} className={`${styles.textHoverToOrange} text-xs`}>
                    Iniciar sesión
                  </Link>
                  <Link href={''} className={`${styles.textHoverToOrange} text-xs`}>
                    Registrarme
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full pb-10 my-auto text-center md:pb-5 h-fit">
            <span className="text-sm text-gray-500 h-fit w-fit">
              developed by{" "}
              <Link
                className={styles.textHoverToOrange}
                target="_blank"
                href={"https://tosunian.dev"}
              >
                tosunian.dev
              </Link>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
