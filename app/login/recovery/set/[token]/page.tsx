import { Metadata } from "next";
import styles from "@/app/css-modules/login.module.css";
import stylesHome from '@/app/css-modules/HomeWhite.module.css'
import sacaturno_logo from "@/public/st_logo_white.png";
import Image from "next/image";
import Link from "next/link";
import { IoIosSearch } from "react-icons/io";
import NewPasswordRecovery from "@/components/NewPasswordRecovery";
import HeaderPublicBlack from "@/components/HeaderPublicBlack";

export const metadata: Metadata = {
  title: "Restablecer contraseña - SacaTurno",
  description: "Aplicación de turnos online",
};

interface propsComponent {
  params: {
    token: string;
  };
}

const SetRecoverPassword: React.FC<propsComponent> = async ({ params }) => {
  return (
    <>
      <HeaderPublicBlack />
      <div style={{height:'calc(100vh - 64px)', paddingTop:'0px', marginBottom:'64px'}}>
        <div className="flex flex-col w-full h-screen lg:flex-row ">
          <div className={`flex-col items-center justify-center hidden w-full pt-0 md:pt-0 md:pb-0 lg:flex pb-14 h-2 lg:h-full lg:w-2/5 ${styles.backgroundImage}`}>
            <Image
              className="w-48 lg:mt-0 lg:w-96"
              alt=""
              src={sacaturno_logo}
            />
            <span className="mt-2 text-sm font-thin text-gray-200 lg:mt-0 lg:text-lg">
              tu app para gestionar tu agenda
            </span>
            <div className="hidden mt-10 lg:block">
              <Link
                href="/public/search"
                type="submit"
                className={`${styles.translucentBtn2} font-light uppercase`}
                style={{ padding: " 12px 16px ", fontSize: "13px" }}
              >
                <IoIosSearch size={24} />
                Buscar empresa
              </Link>
            </div>
          </div>
          <div className={`flex justify-center w-full my-auto md:my-0 pt-10 md:pt-24 items-start md:items-center lg:pt-0 lg:mt-0 h-full lg:w-3/5 ${stylesHome.dottedBg}`}>
            <div className={styles.loginCont}>
              <div className={styles.loginHeader}>
                <h3 className="mb-3 text-2xl font-semibold uppercase lg:text-3xl">
                  Recuperar contraseña
                </h3>
                <span className="text-xs text-left text-gray-500 lg:text-sm">
                  Ingresá una nueva contraseña para tu cuenta.
                </span>
              </div>
              <NewPasswordRecovery token={params.token} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SetRecoverPassword;