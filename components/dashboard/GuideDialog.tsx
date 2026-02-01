"use client";
import Link from "next/dist/client/link";
import { Dialog, DialogClose, DialogContent, DialogFooter } from "../ui/dialog";
import styles from "@/app/css-modules/NoServicesModal.module.css";
import { Separator } from "../ui/separator";


interface Props {
  onClose: () => void;
  openGuideDialog: boolean;
  isFirstLogin: boolean | undefined;
}

const GuideDialog: React.FC<Props> = ({ onClose, openGuideDialog, isFirstLogin }) => {
  return (
    <>
      <Dialog open={openGuideDialog} onOpenChange={onClose}>
        <DialogContent className={`overflow-y-scroll max-w-[92vw] rounded-lg sm:max-w-4xl max-h-[90vh] ${styles.helpContScrollbar} px-7 md:px-10 `}>
          <div className="flex flex-col items-center w-full gap-5 h-fit">
            {isFirstLogin && (<>
              <div className="flex flex-col w-full gap-3 my-2 text-center md:my-4 h-fit">
                <h4 className="text-3xl font-bold 2xl:text-3xl ">
                  👋 ¡Bienvenido!
                </h4>

                <span className="text-sm text-gray-400 md:text-base">
                  En pocos pasos vas a dejar tu agenda lista para empezar a recibir turnos.
                </span>
              </div>
            </>)}

            {!isFirstLogin && (<>
              <div className="flex flex-col w-full gap-3 my-2 text-center h-fit">
                <h4 className="text-3xl font-bold 2xl:text-3xl ">
                  ¿Cómo utilizo la plataforma?
                </h4>

                <span className="text-sm text-gray-400 md:text-base">
                  Te guiamos en los pasos básicos para configurar tu agenda y empezar a recibir turnos.
                </span>
              </div>
            </>)}

            {/* PASO 1 */}
            <div className="flex flex-col w-full gap-4 my-2 h-fit">
              <h4 className="text-lg font-bold md:text-xl ">
                🏢 1. Creá tu empresa
              </h4>

              <div className="flex flex-col gap-3 w-fit h-fit">
                <span className="text-sm font-medium">
                  Este paso es fundamental para personalizar tu agenda.
                </span>

                <span className="text-sm">
                  <b className="text-orange-600">•</b> Definí el nombre de tu negocio
                </span>

                <span className="text-sm">
                  <b className="text-orange-600">•</b> Configurá tus datos básicos
                </span>

                <span className="text-sm">
                  <b className="text-orange-600">•</b> Ajustá horarios y preferencias generales
                </span>

                <span className="text-sm">
                  👉 <b>Sin una empresa creada</b>, no vas a poder cargar servicios ni turnos.
                </span>
              </div>
            </div>
            <Separator className="my-1" />

            {/* PASO 2 */}
            <div className="flex flex-col w-full gap-4 my-2 h-fit">
              <h4 className="text-lg font-bold md:text-xl ">
                🧩 2. Agregá tus servicios
              </h4>

              <div className="flex flex-col gap-3 w-fit h-fit">
                <span className="text-sm">
                  Ahora contanos qué ofrecés.
                </span>

                <span className="text-sm">
                  <b className="text-orange-600">•</b> Creá uno o más servicios
                </span>

                <span className="text-sm">
                  <b className="text-orange-600">•</b> Definí la duración de cada uno
                </span>

                <span className="text-sm">
                  <b className="text-orange-600">•</b> Elegí si requieren confirmación o no
                </span>

                <span className="text-sm">
                  Estos servicios van a ser los que tus clientes podrán reservar.
                </span>
              </div>
            </div>

            <Separator className="my-1" />

            {/* PASO 3 */}
            <div className="flex flex-col w-full gap-4 my-2 h-fit">
              <h4 className="text-lg font-bold md:text-xl ">
                📅 3. Cargá tus turnos en la agenda
              </h4>

              <div className="flex flex-col gap-3 w-fit h-fit">
                <span className="text-sm">
                  Una vez creados los servicios, entrá a <b>Mi agenda</b> y elegí cómo trabajar:
                </span>

                <span className="text-sm">
                  ⚡ <b>Automatizar turnos</b>{" "}
                  <span className="text-gray-400">(recomendado)</span> — el sistema crea los turnos
                  por vos según tu horario.
                </span>

                <span className="text-sm">
                  ✍️ <b>Agregar turnos manualmente</b> — ideal si necesitás más control
                  o tenés horarios variables.
                </span>

                <span className="text-sm">
                  ¡Podés cambiar esta configuración cuando quieras!
                </span>
              </div>
            </div>
            <Separator className="my-5" />

            {/* CTA */}
            {isFirstLogin && (<>
              <div className="flex flex-col w-full gap-3 pb-8 text-center h-fit">
                <h4 className="text-3xl font-bold 2xl:text-3xl ">
                  🎉 ¡Listo para empezar!
                </h4>

                <span className="text-sm">
                  Una vez completados estos pasos, tu agenda estará activa y tus clientes
                  podrán reservar turnos fácilmente.
                </span>

                <Link onClick={onClose} href="/admin/business">
                  <button className="self-center px-6 py-2 mt-2 text-sm font-bold text-white bg-orange-600 rounded-lg hover:bg-orange-700">
                    👉 Crear mi empresa
                  </button>
                </Link>
              </div>
            </>)}

          </div>

        </DialogContent>
      </Dialog>
    </>
  );
};

export default GuideDialog;
