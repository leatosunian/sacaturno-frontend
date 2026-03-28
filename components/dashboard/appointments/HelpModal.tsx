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
      <div className="flex flex-col  w-full gap-8  h-[80vh] sm:h-[75vh] pt-4 ">
        <h4
          className="relative inline-block w-full px-2 mx-auto text-2xl font-bold text-center uppercase"
          style={{ fontSize: 22 }}
        >
          ¿Cómo cargo mis turnos?
          {/* linea */}
          <span
            className="absolute left-0 right-0 mx-auto"
            style={{
              bottom: -2,    // gap entre texto y linea 
              height: 2,     // grosor de la linea
              background: "#dd4924",
              width: "30%",  // ancho opcional de la linea
            }}
          />
        </h4>

        <div
          className={`${styles.helpContScrollbar} flex flex-col pb-5 gap-10 px-5 overflow-y-scroll  `}
        >
          {/* TURNOS AUTOMÁTICOS */}
          <div className="flex flex-col w-full gap-4 h-fit">
            <h4 className="text-lg font-bold uppercase">
              ⚡ Turnos automáticos <span className="text-sm font-normal text-gray-400 lowercase"> (recomendado)</span>
            </h4>

            <div className="flex flex-col gap-4 w-fit h-fit">
              <span className="text-sm flex gap-2">
                <b className="text-orange-600">1.</b> Ingresá a
                <Link
                  href={"/admin/schedule/settings"}
                  className="flex items-center gap-1 w-fit font-semibold hover:underline underline-offset-2"
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
            <h4 className="text-lg font-bold uppercase">
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
              <h4 className="mb-4 text-lg font-bold uppercase">
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
                Combinar horarios <span className="text-sm font-normal text-gray-400 lowercase"> (turnos largos)</span>
              </label>

              <span className="text-sm">
                Para crear un turno más largo,
                <b> mantené presionado</b> el horario de inicio y
                <b> arrastrá</b> hasta el horario de finalización.
              </span>

              <Image
                alt="Agregar turno largo"
                className="w-3/6 mt-2 rounded-xl"
                src={addmultiple}
              />
            </div>
          </div>
        </div>


        {/* <span>Hacé click en un turno para ver los detalles</span> */}
      </div>
    </>
  );
};

export default HelpModal;
