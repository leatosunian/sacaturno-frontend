import Link from "next/link";
import { FaCheck, FaMedal } from "react-icons/fa6";
import { MdMoneyOff, MdOutlineAddBusiness } from "react-icons/md";
import homeStyles from "@/app/css-modules/HomeWhite.module.css";
import styles from "@/app/css-modules/login.module.css";
import { SiAdguard } from "react-icons/si";

const PricingSection = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center w-full gap-12 py-5 text-black h-fit lg:py-0 lg:h-screen">
        {/* HEADER */}
        <div className="w-full text-center h-fit">
          <h3 className="mb-1 text-xl font-semibold text-black md:text-2xl">
            Planes
          </h3>
          <span className="flex items-center justify-center gap-2 text-lg font-normal text-gray-600 px-7 md:px-0">
            <SiAdguard className="hidden md:block" color="" />
            Pagá de manera segura mediante Mercado Pago
          </span>
        </div>

        <div className={homeStyles.pricingCardCont}>
          <div className={homeStyles.pricingCard}>
            <div className="mb-5">
              <h4 className="flex items-center gap-2 mb-3 text-2xl font-semibold xl:text-3xl">
                <MdMoneyOff
                  color="#dd4924"
                  className="hidden xl:block"
                  size={35}
                />
                <MdMoneyOff
                  color="#dd4924"
                  className="block xl:hidden"
                  size={30}
                />
                Plan Prueba
              </h4>

              <div>
                <span className="mr-1 text-2xl font-semibold lg:text-2xl">
                  $0
                </span>
                <span className="text-sm text-gray-800">ARS/mes</span>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                height: "1px",
                background: "rgba(255, 255, 255, 0.2)",
              }}
            ></div>

            <div className="flex flex-col gap-2">
              <h5 className="mt-5 mb-2 text-sm font-semibold text-center lg:text-md">
                EL PLAN INCLUYE
              </h5>
              <div className="flex items-center justify-center gap-3 w-fit h-fit">
                <FaCheck size={12} />
                <span className="text-xs text-black">
                  Prueba gratuita por 30 días
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 w-fit h-fit">
                <FaCheck size={12} />
                <span className="text-xs text-black">
                  1 servicio por empresa
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 w-fit h-fit">
                <FaCheck size={12} />
                <span className="text-xs text-black">Un turno por horario</span>
              </div>
              <div className="flex items-center justify-center gap-3 w-fit h-fit">
                <FaCheck size={12} />
                <span className="text-xs text-black">
                  Notificaciones por email
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 w-fit h-fit">
                <FaCheck size={12} />
                <span className="text-xs text-black">Soporte 24/7</span>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                height: "1px",
                background: "rgba(0, 0, 0, 0.2)",
                margin: "30px 0",
              }}
            ></div>

            <div className="flex justify-center w-full ">
              <Link
                href="/register"
                type="submit"
                className={`${homeStyles.btnAnimated} font-normal`}
                style={{ padding: " 13px 15px ", width: "100%" }}
              >
                <MdOutlineAddBusiness size={24} />
                Crear empresa
              </Link>
            </div>
          </div>

          <div className={homeStyles.pricingCard}>
            <div className="mb-5">
              <h4 className="flex items-center gap-3 mb-3 text-2xl font-semibold xl:text-3xl">
                <FaMedal
                  color="#dd4924"
                  className="hidden xl:block"
                  size={30}
                />
                <FaMedal
                  color="#dd4924"
                  className="block xl:hidden"
                  size={25}
                />
                Plan Full
              </h4>
              <div>
                <span className="mr-1 text-2xl font-semibold lg:text-2xl">
                  $6900
                </span>
                <span className="text-sm text-gray-800">ARS/mes</span>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                height: "1px",
                background: "rgba(0, 0, 0, 0.2)",
              }}
            ></div>

            <div className="flex flex-col gap-2">
              <h5 className="mt-5 mb-2 text-sm font-semibold text-center lg:text-md">
                EL PLAN INCLUYE
              </h5>
              <div className="flex items-center justify-center gap-3 w-fit h-fit">
                <FaCheck size={12} />
                <span className="text-xs text-black">Turnos ilimitados</span>
              </div>
              <div className="flex items-center justify-center gap-3 w-fit h-fit">
                <FaCheck size={12} />
                <span className="text-xs text-black">Servicios ilimitados</span>
              </div>
              <div className="flex items-center justify-center gap-3 w-fit h-fit">
                <FaCheck size={12} />
                <span className="text-xs text-black">
                  Notificaciones por email
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 w-fit h-fit">
                <FaCheck size={12} />
                <span className="text-xs text-black">Soporte 24/7</span>
              </div>
              <div className="flex items-center justify-center gap-3 w-fit h-fit">
                <FaCheck size={12} />
                <span className="text-xs text-black">
                  Turnos simultáneos en un mismo horario
                </span>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                height: "1px",
                background: "rgba(255, 255, 255, 0.2)",
                margin: "30px 0",
              }}
            ></div>

            <div className="flex justify-center w-full ">
              <Link
                href="/register"
                type="submit"
                className={`${homeStyles.btnAnimated} font-normal`}
                style={{ padding: " 13px 15px ", width: "100%" }}
              >
                <MdOutlineAddBusiness size={24} />
                Crear empresa
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PricingSection;
