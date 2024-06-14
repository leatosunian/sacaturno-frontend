import Image from "next/image";
import homeStyles from "@/app/css-modules/home.module.css";
import styles from "@/app/css-modules/login.module.css";
import sacaturno_logo from "@/public/st_logo_white.png";
import { IoIosSearch } from "react-icons/io";
import Link from "next/link";
import { CiLogin } from "react-icons/ci";
import { MdOutlineAddBusiness } from "react-icons/md";
import { FaArrowDown, FaCheck } from "react-icons/fa6";
import PricingSection from "@/components/home/PricingSection";
import HeaderPublic from "@/components/HeaderPublic";
import { Metadata } from "next";
import Accordion from "@/components/Accordion";

export const metadata: Metadata = {
  title: "SacaTurno | Tu app de turnos online",
  description: "Aplicación de turnos online",
};

export default function Home() {
  return (
    <>
      <HeaderPublic />
      <div className={`${homeStyles.pricingCont} md:mt-0`}>
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
                    className={`${styles.translucentBtn2} font-light uppercase`}
                    style={{ padding: " 12px 16px ", fontSize: "13px" }}
                  >
                    <IoIosSearch size={24} />
                    Reservar turno
                  </Link>
                </div>
                <div className="">
                  <Link
                    href="/login"
                    type="submit"
                    className={`${styles.translucentBtn2} font-light uppercase`}
                    style={{ padding: " 12px 16px ", fontSize: "13px" }}
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

          <div className="flex flex-col items-start justify-center w-full px-8 text-white py-14 md:py-20 h-fit lg:h-full lg:w-full">
            <div className="flex flex-col w-full mb-10 h-fit">
              <h5
                style={{ fontSize: "42px", lineHeight: "50px" }}
                className="mb-10 font-bold uppercase"
              >
                Digitalizá la gestión de tu negocio
              </h5>
              <p className="mb-3 font-extralight text-md">
                Tu solución integral para la gestión de turnos. Simplificá tu
                día a día, maximizá la eficiencia y ofrecé una experiencia
                excepcional a tus clientes.
              </p>
              <p className="font-extralight text-md">
                ¡Regístrate hoy mismo para obtener una prueba gratuita de 30
                días! hacé click en el boton de abajo, registrate, creá tu
                empresa y comenzá a gestionar tus turnos
              </p>
            </div>
            <div className="">
              <Link
                href="/login"
                type="submit"
                className={`${styles.translucentBtn2} font-light uppercase`}
                style={{ padding: " 12px 16px ", fontSize: "13px" }}
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
            className={`${styles.translucentBtn2} font-light uppercase`}
            style={{ padding: " 10px 16px ", fontSize: "13px" }}
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
          margin: "50px auto 0px auto",
        }}
        className="hidden md:block"
      ></div>

      <div
        style={{
          width: "40%",
          height: "1px",
          background: "rgba(255, 255, 255, 0.2)",
          margin: "5rem auto",
        }}
        className="block md:hidden"
      ></div>

      {/* PRICING SECTION */}

      <PricingSection />
      <div
        style={{
          width: "40%",
          height: "1px",
          background: "rgba(255, 255, 255, 0.2)",
          margin: "0px auto 5rem auto",
        }}
        className="hidden lg:block"
      ></div>
      <div
        style={{
          width: "40%",
          height: "1px",
          background: "rgba(255, 255, 255, 0.2)",
          margin: "5rem auto",
        }}
        className="block lg:hidden"
      ></div>

      <div className="flex flex-col items-center justify-center w-full gap-12 h-fit ">
        <header className="text-center">
          <h4 className="text-3xl font-semibold text-white ">
            Preguntas frecuentes
          </h4>
        </header>
        <div className="w-full px-6 md:w-4/6 lg:w-1/2 md:px-0 h-fit rounded-xl ">
          <Accordion
            title="¿Cómo reservo un turno?"
            answer='En la pagina principal accedé al menú, hacé click en "Reservar turno", buscá el nombre de la empresa. En el resultado de la busqueda pulsá en el ícono del calendario, cliqueá en el turno disponible que desees, llená tus datos y realizá la reserva. Una vez hecho el turno, recibirás un correo con los datos de la reserva. Si no lo recibiste, revisá la carpeta de correo no deseado.'
          />
          <Accordion
            title="¿Cómo creo mi empresa?"
            answer='Primero debés registrarte y confirmar tu cuenta en el correo que te enviaremos luego del registro. Una vez hayas activado tu cuenta, iniciá sesión y accedé a "Mi empresa", completá los datos de tu negocio y hacé click en "Crear empresa". Recordá crear un servicio para poder comenzar a cargar tus turnos. '
          />
          <Accordion
            title="¿Como cancelo un turno?"
            answer="Podés cancelar el turno en el mismo momento que hiciste la reserva. Si deseas cancelarlo luego, debes contactarte con el dueño de la empresa mediante el correo y/o el teléfono de contacto que te enviamos al realizar la reserva del turno."
          />
          <Accordion
            title="¿Como cancelo un turno?"
            answer="Podés cancelar el turno en el mismo momento que hiciste la reserva. Si deseas cancelarlo luego, debes contactarte con el dueño de la empresa mediante el correo y/o el teléfono de contacto que te enviamos al realizar la reserva del turno."
          />
          <Accordion
            title="¿Como cancelo un turno?"
            answer="Podés cancelar el turno en el mismo momento que hiciste la reserva. Si deseas cancelarlo luego, debes contactarte con el dueño de la empresa mediante el correo y/o el teléfono de contacto que te enviamos al realizar la reserva del turno."
          />
        </div>

        <div
          style={{
            width: "40%",
            height: "1px",
            background: "rgba(255, 255, 255, 0.2)",
            margin: "5rem auto",
          }}
        ></div>
      </div>
    </>
  );
}
