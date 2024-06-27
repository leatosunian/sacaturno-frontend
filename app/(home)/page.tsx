import Image from "next/image";
import homeStyles from "@/app/css-modules/HomeWhite.module.css";
import styles from "@/app/css-modules/login.module.css";
import sacaturno_logo from "@/public/deviceframes2.png";
import { IoIosSearch } from "react-icons/io";
import Link from "next/link";
import { CiLogin } from "react-icons/ci";
import { MdOutlineAddBusiness } from "react-icons/md";
import { FaArrowDown, FaCheck } from "react-icons/fa6";
import PricingSection from "@/components/home/PricingSection";
import HeaderPublic from "@/components/HeaderPublic";
import { Metadata } from "next";
import Accordion from "@/components/Accordion";
import HeaderPublicBlack from "@/components/HeaderPublicBlack";

export const metadata: Metadata = {
  title: "SacaTurno | Tu app de turnos online",
  description: "Aplicación de turnos online",
};

export default function Home() {
  return (
    <>
      <HeaderPublicBlack />

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
          <h4 className="text-3xl font-semibold text-black ">
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
