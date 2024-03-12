import { Metadata } from "next";
import styles from "@/app/css-modules/login.module.css";
import FormLogin from "@/components/FormLogin";
import FormRegistrate from "@/components/FormRegistrate";
import Image from "next/image";
export const metadata: Metadata = {
  title: "Registrate - SacaTurno",
  description: "Aplicación de turnos online",
};
import sacaturno_logo from "@/public/st_logo_white.png";
import LoginRegisterFooter from "@/components/FooterLoginRegister";

export default function Login() {
  return (
    <>
      <div className={styles.backgroundImage}>
        <div className="flex flex-col w-full h-screen lg:flex-row">
          <div className="flex flex-col items-center justify-center w-full py-12 h-fit lg:h-full lg:w-1/2">
            <Image
              className="w-44 lg:mt-0 lg:w-96"
              alt=""
              src={sacaturno_logo}
            />
            <span className="lg:text-lg text-sm font-thin text-gray-200">tu app para gestionar tu agenda</span>
          </div>

          <div className="flex justify-center w-full align-middle lg:mt-0 h-fit lg:h-full lg:w-1/2">
            <div className={styles.loginCont}>
              <div className={styles.loginHeader}>
                <h3 className="mb-3 text-3xl font-semibold lg:text-4xl ">
                  Registrate
                </h3>
                <span className="text-xs text-center lg:text-sm">
                  ¡Creá tu cuenta y cargá tus turnos!
                </span>
              </div>
              <FormRegistrate />
            </div>
          </div>
        </div>
      </div>

      <LoginRegisterFooter/>
    </>
  );
}
