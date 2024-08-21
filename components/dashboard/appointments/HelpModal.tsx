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

          <div
            className={`${styles.helpContScrollbar} flex flex-col gap-6 overflow-y-scroll px-5 md:px-8 md:mr-4 mr-2`}
          >
            <div className="flex flex-col w-full gap-4 my-2 h-fit">
              <h4 className="text-base font-bold text-center uppercase ">
                Turnos automáticos
              </h4>
              <div className="flex flex-col gap-2 w-fit h-fit">
                {/* <label
                  style={{ fontSize: "14px" }}
                  className="font-bold uppercase "
                >
                  Crear todos los turnos del día
                </label> */}
                <span className="text-sm">
                  - Ingresá a <b>Configuración de Agenda</b>
                </span>
                <span className="text-sm">
                  - Configurá tu <b>horario de atención</b>: por cada día de la
                  semana, ingresá el horario de trabajo, la duración de cada
                  turno y agregá los turnos y servicios que ofrezcas
                </span>
                <span className="text-sm">
                  - Debajo, en la sección de <b>Automatizar turnos</b>, habilitá
                  la opción <b>Crear turnos automaticamente</b>
                </span>
                <span className="text-sm">
                  - Seleccioná la cantidad de días que quieras crear turnos y
                  cuántos dias antes del último turno querés volver a crear los
                  turnos programados
                </span>
                <span className="text-sm">
                  <b>&#127881; ¡Y listo!</b> A partir del día que habilites la
                  función se crearán los turnos agregados en el horario de
                  atención
                </span>
              </div>
            </div>

            <div className="flex flex-col w-full gap-4 my-2 h-fit">
              <h4 className="text-base font-bold text-center uppercase ">
                agregar turnos manualmente
              </h4>
              <div className="flex flex-col gap-2 w-fit h-fit">
                {/* <label
                  style={{ fontSize: "14px" }}
                  className="font-bold uppercase "
                >
                  Crear todos los turnos del día
                </label> */}
                <span className="text-sm">
                  Si preferís no automatizar tus turnos y querés crearlos manualmente, tenés que ingresar a <b>Mi agenda</b> y agregar los turnos que desees.
                </span>
                <span className="text-sm">
                  Para variar la duración de los turnos, podés cambiar el intervalo a los minutos que desees (ej. 30 minutos).
                </span>

              </div>
            </div>

            <div className="flex flex-col w-full gap-4 my-2 h-fit">
              <div className="flex flex-col gap-2 w-fit h-fit">
                <h4 className="text-base mb-4 font-bold text-center uppercase ">
                  Cómo usar el panel
                </h4>
                <label
                  style={{ fontSize: "14px" }}
                  className="font-bold uppercase "
                >
                  Agregar un turno
                </label>
                <span className="text-sm">
                  En tu celular, mantené pulso el
                  casillero del horario de tu nuevo turno (hasta que el
                  casillero se marque de gris), seleccioná el servicio que
                  brindes en ese turno y hacé clic en <b>Crear turno</b>
                </span>
                <span className="mt-1 text-sm">
                  En tu computadora, cliqueá en el casillero del horario de tu
                  nuevo turno, seleccioná el servicio que brindes en ese turno y
                  hacé clic en <b>Crear turno</b>
                </span>
              </div>
            </div>

            <div className="flex flex-col w-full gap-4 my-2 h-fit">
              <div className="flex flex-col gap-2 w-fit h-fit">
                <label
                  style={{ fontSize: "14px" }}
                  className="font-bold uppercase "
                >
                  Combinar horarios
                </label>
                <span className="text-sm">
                  <b>Mantené presionado</b> el casillero de la hora de inicio del turno
                  y <b>arrastrá</b> hasta el horario que quieras que finalice.
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
