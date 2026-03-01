"use client";
import styles from "@/app/css-modules/NoServicesModal.module.css";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const NoServicesModal: React.FC = () => {
  return (
    <>
      <div className="flex flex-col items-center w-full gap-10 pt-3 h-fit">
        <h4
          className="relative inline-block w-full px-2 mx-auto text-2xl font-bold text-center uppercase"
          style={{ fontSize: 22 }}
        >
          No tenés servicios
          {/* linea */}
          <span
            className="absolute left-0 right-0 mx-auto"
            style={{
              bottom: -2,
              height: 2,
              background: "#dd4924",
              width: "30%",
            }}
          />
        </h4>

        {/* <span>Hacé click en un turno para ver los detalles</span> */}
        <div className="flex flex-col w-full h-fit">
          <div className="flex flex-col w-fit h-fit">
            <label
              className="font-medium text-center text-md"
            >
              ¡Debés crear al menos un servicio para comenzar a cargar tus
              turnos!
            </label>
          </div>
        </div>
        <Link href={"/admin/business/settings"} className="w-full">
          <Button   className="w-full text-white bg-red-600 border-none rounded-lg shadow-xl outline-none h-11 hover:bg-red-700">Crear servicio</Button>
        </Link>
      </div>
    </>
  );
};

export default NoServicesModal;
