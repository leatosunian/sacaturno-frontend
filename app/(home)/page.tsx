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

export default function Home() {
  return (
    <>
      
      <div className={`${homeStyles.pricingCont} md:mt-0`}>
      <HeaderPublic />
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
                    className={`${styles.translucentBtn2} font-thin`}
                    style={{ padding: " 10px 15px " }}
                  >
                    <IoIosSearch size={24} />
                    Reservar turno
                  </Link>
                </div>
                <div className="">
                  <Link
                    href="/login"
                    type="submit"
                    className={`${styles.translucentBtn2} font-thin`}
                    style={{ padding: " 10px 15px " }}
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

          <div className="flex flex-col items-start justify-center w-full px-8 text-white py-14 md:py-28 h-fit lg:h-full lg:w-full">
            <div className="flex flex-col w-full mb-10 h-fit">
              <h5 className="mb-10 text-5xl font-bold">
                Digitalizá la gestión de tu negocio
              </h5>
              <p className="mb-3 font-thin text-md">
                Con SacaTurno tenés un potente administrador de turnos, y tu
                propio sitio web sin competidores a la vista y estética adaptada
                a tu negocio.
              </p>
              <p className="font-thin text-md">
                Para iniciar tu prueba gratuita por 30 dias hacé click en el
                boton de abajo, registrate, creá tu empresa y comenzá a
                gestionar tus turnos
              </p>
            </div>
            <div className="">
              <Link
                href="/login"
                type="submit"
                className={`${styles.translucentBtn2} font-thin`}
                style={{ padding: " 10px 15px " }}
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
            className={`${styles.translucentBtn2} font-thin`}
            style={{ padding: " 10px 15px " }}
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
