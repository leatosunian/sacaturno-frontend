"use client";
import styles from "@/app/css-modules/NoServicesModal.module.css";
import { IoMdClose } from "react-icons/io";
import Image from "next/image";
import addmultiple from "@/public/addmultiple.gif";

interface Props {
  onClose: () => void;
}

const HelpModal: React.FC<Props> = ({ onClose }) => {
  return (
    <>
      <div className="absolute flex items-center justify-center py-8 md:py-20 modalCont">
        <div className={`${styles.helpCont} borderShadow`}>
          <IoMdClose
            className={styles.closeModal}
            onClick={() => onClose()}
            size={22}
          />
          <h4 className="px-5 mb-6 text-xl font-bold text-center uppercase ">
            ¿Cómo cargo mis turnos?
          </h4>

          <div className={`${styles.helpContScrollbar} flex flex-col gap-6 overflow-y-scroll`}>
            <div className="flex flex-col w-full gap-4 my-2 h-fit">
              <div className="flex flex-col gap-2 w-fit h-fit">
                <label
                  style={{ fontSize: "14px" }}
                  className="font-bold uppercase "
                >
                  Crear un turno
                </label>
                <span className="text-sm">
                  En tu celular, mantené presionado el casillero del horario de tu neuvo turno (hasta que el casillero se marque de gris), seleccioná el servicio que brindes en ese turno y hacé clic en &ldquo;Crear turno&ldquo;
                </span>
                <span className="mt-1 text-sm">
                  En tu computadora, cliqueá en el casillero del horario de tu nuevo turno, seleccioná el servicio que brindes en ese turno y hacé clic en &ldquo;Crear turno&ldquo;
                </span>
              </div>
            </div>

            <div className="flex flex-col w-full gap-4 my-2 h-fit">
              <div className="flex flex-col gap-2 w-fit h-fit">
                <label
                  style={{ fontSize: "14px" }}
                  className="font-bold uppercase "
                >
                  Crear todos los turnos del día
                </label>
                <span className="text-sm">
                  Hacé click en los tres puntos en la esquina superior derecha,
                  seleccioná la opcion &ldquo;Crear turnos del día&ldquo;, elegí
                  qué servicio necesitás crear
                </span>
              </div>
            </div>

            <div className="flex flex-col w-full gap-4 my-2 h-fit">
              <div className="flex flex-col gap-2 w-fit h-fit">
                <label
                  style={{ fontSize: "14px" }}
                  className="font-bold uppercase "
                >
                  Combinar turnos
                </label>
                <span className="text-sm">
                  Mantené presionado el casillero de la hora de comienzo del
                  turno y arrastrá hasta el horario que finalice para crear
                  turnos dobles, tríples, etc.
                </span>
                <Image
                  alt="Agregar turno largo"
                  className="w-5/6 mt-2 rounded-xl"
                  src={addmultiple}
                />
              </div>
            </div>


          </div>
        </div>

        {/* <span>Hacé click en un turno para ver los detalles</span> */}
      </div>
    </>
  );
};

export default HelpModal;
