import Link from "next/link";
import { FaCheck } from "react-icons/fa6";
import { MdOutlineAddBusiness } from "react-icons/md";
import homeStyles from "@/app/css-modules/home.module.css";
import styles from "@/app/css-modules/login.module.css";

const PricingSection = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center w-full gap-12 text-white h-fit lg:h-screen">
        {/* HEADER */}
        <div className="w-full text-center h-fit">
          <h3 className="text-3xl font-semibold">Planes</h3>
        </div>

        <div className={homeStyles.pricingCardCont}>
          <div className={homeStyles.pricingCard}>
            <div className="mb-5">
              <h4 className="mb-3 text-3xl font-semibold lg:text-3xl">
                Plan Prueba
              </h4>
              <div>
                <span className="mr-1 text-2xl font-semibold lg:text-2xl">
                  $0
                </span>
                <span className="text-sm text-gray-400">ARS/mes</span>
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
                <span className="text-xs text-gray-300">
                  Prueba gratuita por 30 días
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 w-fit h-fit">
                <FaCheck size={12} />
                <span className="text-xs text-gray-300">
                  70 turnos mensuales
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 w-fit h-fit">
                <FaCheck size={12} />
                <span className="text-xs text-gray-300">
                  1 servicio por empresa
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 w-fit h-fit">
                <FaCheck size={12} />
                <span className="text-xs text-gray-300">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 w-fit h-fit">
                <FaCheck size={12} />
                <span className="text-xs text-gray-300">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 w-fit h-fit">
                <FaCheck size={12} />
                <span className="text-xs text-gray-300">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit
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
                className={`${styles.translucentBtn2} font-thin`}
                style={{ padding: " 13px 15px ", width: "100%" }}
              >
                <MdOutlineAddBusiness size={24} />
                Crear empresa
              </Link>
            </div>
          </div>

          <div className={homeStyles.pricingCard}>
            <div className="mb-5">
              <h4 className="mb-3 text-3xl font-semibold lg:text-3xl">
                Plan Full
              </h4>
              <div>
                <span className="mr-1 text-2xl font-semibold lg:text-2xl">
                  $6900
                </span>
                <span className="text-sm text-gray-400">ARS/mes</span>
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
                <span className="text-xs text-gray-300">
                  Turnos ilimitados
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 w-fit h-fit">
                <FaCheck size={12} />
                <span className="text-xs text-gray-300">
                  Servicios ilimitados
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 w-fit h-fit">
                <FaCheck size={12} />
                <span className="text-xs text-gray-300">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 w-fit h-fit">
                <FaCheck size={12} />
                <span className="text-xs text-gray-300">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 w-fit h-fit">
                <FaCheck size={12} />
                <span className="text-xs text-gray-300">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 w-fit h-fit">
                <FaCheck size={12} />
                <span className="text-xs text-gray-300">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit
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
                className={`${styles.translucentBtn2} font-thin`}
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
