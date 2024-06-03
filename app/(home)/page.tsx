import Image from "next/image";
import homeStyles from "@/app/css-modules/home.module.css";
import styles from "@/app/css-modules/login.module.css";
import LoginRegisterFooter from "@/components/FooterLoginRegister";
import sacaturno_logo from "@/public/st_logo_white.png";
import { IoIosSearch } from "react-icons/io";
import Link from "next/link";
import { CiLogin } from "react-icons/ci";
import { MdOutlineAddBusiness } from "react-icons/md";
import { FaArrowDown, FaCheck } from "react-icons/fa6";
import PricingSection from "@/components/home/PricingSection";
import HeaderPublic from "@/components/HeaderPublic";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SacaTurno | Tu app de turnos online",
  description: "Aplicación de turnos online",
};

export default function Home() {
  return (
    <>
      <HeaderPublic />
      <div className={`${homeStyles.pricingCont} md:mt-0`}>
        <div
          className={`mt-24 lg:mt-0 flex flex-col w-11/12 h-fit lg:flex-row items-center ${homeStyles.mainSectionCont}`}
        >
          <div className="flex-col items-center justify-center hidden px-10 lg:flex md:px-16 h-fit lg:h-full w-fit">
            <div className="flex flex-col items-center mb-6">
              <Image
                className="w-48 lg:mt-0 lg:w-96"
                alt=""
                src={sacaturno_logo}
              />
              <span className="mt-2 text-sm font-thin text-gray-200 lg:mt-0 lg:text-md">
                tu app para gestionar tu agenda
              </span>
            </div>

            <div className={homeStyles.buttonsCont}>
              <div className="flex flex-col gap-4 lg:flex-row w-fit h-fit">
                <div className="">
                  <Link
                    href="/public/search"
                    type="submit"
                    className={`${styles.translucentBtn2} font-light uppercase`}
                    style={{ padding: " 12px 16px ", fontSize: "13px" }}
                  >
                    <IoIosSearch size={24} />
                    Reservar turno
                  </Link>
                </div>
                <div className="">
                  <Link
                    href="/login"
                    type="submit"
                    className={`${styles.translucentBtn2} font-light uppercase`}
                    style={{ padding: " 12px 16px ", fontSize: "13px" }}
                  >
                    <CiLogin size={24} />
                    Iniciar sesión
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              width: "1px",
              height: "400px",
              background: "rgba(255, 255, 255, 0.2)",
            }}
            className="hidden lg:block"
          ></div>

          <div className="flex flex-col items-start justify-center w-full px-8 text-white py-14 md:py-20 h-fit lg:h-full lg:w-full">
            <div className="flex flex-col w-full mb-10 h-fit">
              <h5
                style={{ fontSize: "42px", lineHeight: "50px" }}
                className="mb-10 font-bold uppercase"
              >
                Digitalizá la gestión de tu negocio
              </h5>
              <p className="mb-3 font-extralight text-md">
                Tu solución integral para la gestión de turnos. Simplificá tu
                día a día, maximizá la eficiencia y ofrecé una experiencia
                excepcional a tus clientes.
              </p>
              <p className="font-extralight text-md">
                ¡Regístrate hoy mismo para obtener una prueba gratuita de 30
                días! hacé click en el boton de abajo, registrate, creá tu
                empresa y comenzá a gestionar tus turnos
              </p>
            </div>
            <div className="">
              <Link
                href="/login"
                type="submit"
                className={`${styles.translucentBtn2} font-light uppercase`}
                style={{ padding: " 12px 16px ", fontSize: "13px" }}
              >
                <CiLogin size={24} />
                Iniciar prueba
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute hidden bottom-7 md:block">
          <Link
            href="/login"
            type="submit"
            className={`${styles.translucentBtn2} font-light uppercase`}
            style={{ padding: " 10px 16px ", fontSize: "13px" }}
          >
            <FaArrowDown size={13} />
            Ver planes
          </Link>
        </div>
      </div>

      <div
        style={{
          width: "40%",
          height: "1px",
          background: "rgba(255, 255, 255, 0.2)",
          margin: "34px auto",
        }}
      ></div>

      {/* PRICING SECTION */}

      <PricingSection />
    </>
  );
}
