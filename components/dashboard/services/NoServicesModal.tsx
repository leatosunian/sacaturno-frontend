"use client";
import styles from "@/app/css-modules/NoServicesModal.module.css";
import Link from "next/link";

const NoServicesModal: React.FC = () => {
  return (
    <>
      <div
        className="absolute flex items-center justify-center modalCont "
        style={{ top: "64px" }}
      >
        <div
          className="flex flex-col text-black bg-white w-80 md:w-96 p-7 h-fit borderShadow"
          style={{ transform: "translateY(-32px)" }}
        >
          <h4 className="mb-6 text-xl font-bold text-center uppercase">
            No tenés servicios
          </h4>
          {/* <span>Hacé click en un turno para ver los detalles</span> */}
          <div className="flex flex-col gap-4 mb-7 w-fit h-fit">
            <div className="flex flex-col w-fit h-fit">
              <label
                style={{ fontSize: "14px" }}
                className="font-normal text-center"
              >
                ¡Debés crear al menos un servicio para comenzar a cargar tus
                turnos!
              </label>
            </div>
          </div>
          <Link href={"/admin/business/settings"}>
            <button className={styles.button}>Crear servicio</button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default NoServicesModal;
