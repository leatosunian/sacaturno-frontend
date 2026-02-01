"use client";
import styles from "@/app/css-modules/NoServicesModal.module.css";
import { IoMdClose } from "react-icons/io";
import Image from "next/image";
import addmultiple from "@/public/addmultiple.gif";
import { FaExternalLinkAlt } from "react-icons/fa";
import Link from "next/link";

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
            {/* TURNOS AUTOMÁTICOS */}
            <div className="flex flex-col w-full gap-4 my-2 h-fit">
              <h4 className="text-lg font-bold uppercase">
                ⚡ Turnos automáticos <span className="text-sm font-normal text-gray-400 lowercase"> (recomendado)</span>
              </h4>

              <div className="flex flex-col gap-4 w-fit h-fit">
                <span className="flex flex-col gap-2 text-sm sm:flex-row">
                  <b className="text-orange-600">1.</b> Ingresá a
                  <Link
                    href={"/admin/schedule/settings"}
                    className="flex items-center gap-1 font-semibold hover:underline underline-offset-2"
                  >
                    <FaExternalLinkAlt size={12} />
                    Configuración de agenda
                  </Link>
                </span>

                <span className="text-sm">
                  <b className="text-orange-600">2.</b>  Configurá tu <b>horario de atención</b>:
                  definí los días y horarios de trabajo, la duración de cada turno
                  y los servicios que ofrecés.
                </span>

                <span className="text-sm">
                  <b className="text-orange-600">3.</b>  En la sección <b>Automatizar turnos</b>, activá la opción
                  <b> Crear turnos automáticamente</b>.
                </span>

                <span className="text-sm">
                  <b className="text-orange-600">4.</b> Elegí cuántos días querés generar turnos y
                  cuántos días antes del último turno el sistema debe volver
                  a crearlos.
                </span>

                <span className="text-sm">
                  <b>🎉 ¡Listo!</b> A partir de ese momento, los turnos se
                  crearán de forma automática según tu configuración.
                </span>
              </div>
            </div>

            {/* TURNOS MANUALES */}
            <div className="flex flex-col w-full gap-4 my-2 h-fit">
              <h4 className="text-lg font-bold text-center uppercase">
                ✍️ Turnos manuales
              </h4>

              <div className="flex flex-col gap-3 w-fit h-fit">
                <span className="text-sm">
                  Si preferís mayor control, podés crear tus turnos manualmente
                  desde <b>Mi agenda</b>, eligiendo el día y horario que desees.
                </span>

                <span className="text-sm">
                  También podés modificar la duración de los turnos cambiando
                  el intervalo (por ejemplo: 15, 30 o 60 minutos).
                </span>
              </div>
            </div>

            {/* USO DEL PANEL */}
            <div className="flex flex-col w-full gap-4 my-2 h-fit">
              <div className="flex flex-col gap-2 w-fit h-fit">
                <h4 className="mb-4 text-lg font-bold text-center uppercase">
                  🧭 Cómo usar la agenda
                </h4>

                <label
                  style={{ fontSize: "14px" }}
                  className="font-bold uppercase"
                >
                  Agregar un turno
                </label>

                <span className="text-sm">
                  <b>Desde el celular:</b> mantené presionado el horario deseado
                  hasta que se marque en gris, seleccioná el servicio y tocá
                  <b> Crear turno</b>.
                </span>

                <span className="mt-1 text-sm">
                  <b>Desde la computadora:</b> hacé clic en el horario,
                  elegí el servicio y presioná <b>Crear turno</b>.
                </span>
              </div>
            </div>

            {/* COMBINAR HORARIOS */}
            <div className="flex flex-col w-full gap-4 my-2 h-fit">
              <div className="flex flex-col gap-2 w-fit h-fit">
                <label
                  style={{ fontSize: "14px" }}
                  className="font-bold uppercase"
                >
                  Combinar horarios (turnos largos)
                </label>

                <span className="text-sm">
                  Para crear un turno más largo,
                  <b> mantené presionado</b> el horario de inicio y
                  <b> arrastrá</b> hasta el horario de finalización.
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
