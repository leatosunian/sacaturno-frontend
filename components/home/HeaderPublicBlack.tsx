"use client";
import Link from "next/link";
import { NextPage } from "next";
import { RxHamburgerMenu } from "react-icons/rx";
import { RxCross2 } from "react-icons/rx";
import styles from "@/app/css-modules/header.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import sacaturno_logo from "@/public/st_logo_white.png";
import { MdLogin, MdSearch } from "react-icons/md";

interface Props { }

const HeaderPublicBlack: NextPage<Props> = ({ }) => {
  const [active, setActive] = useState(false);
  const router = useRouter();
  const handleActiveNavBar = () => {
    setActive(!active);
  };
  const closeNavMenu = () => {
    setActive(false);
  };

  return (
    <>
      <div
        className={`fixed flex justify-between w-full h-16 px-6 text-white md:px-0 md:justify-around position-absolute border-bottom-2 `}
        style={{
          zIndex: "99999",
          backdropFilter: "blur(6px)",
          background: "rgba(0, 0, 0, 1)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <div className="flex items-center h-full gap-1 j ustify-center w-fit ">
          {/* <FcCalendar size={34} />
          <h1 className="text-md">SacaTurno</h1> */}
          <Link href={"/"}>
            <Image className="hidden w-32 md:block " src={sacaturno_logo} alt="SacaTurno" />
            <Image className="block w-28 md:hidden" src={sacaturno_logo} alt="SacaTurno" />
          </Link>
        </div>


        <div className="items-center justify-center hidden gap-12 text-sm md:flex">
          {/* <div>
            <Link
              href="/public/search"
              className="text-xs font-semibold transition-all duration-100 ease-in-out cursor-pointer hover:text-orange-600 hover:transition-all hover:duration-100 "
            >
              Reservar turno
            </Link>
          </div>
          <div>
            <Link
              href="/register"
              className="text-xs font-semibold transition-all duration-100 ease-in-out cursor-pointer hover:text-orange-600 hover:transition-all hover:duration-100 "
            >
              Crear cuenta
            </Link>
          </div> */}

          <div className="flex gap-4">
            <Link href="/public/search" className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all duration-300 ease-in-out bg-black border border-white rounded-lg cursor-pointer border-opacity-30 hover:bg-orange-600 hover:border-orange-600 hover:transition-all hover:duration-300 ">
              <MdSearch className="" size={16} />
              Buscar negocio
            </Link>

            <Link href="/login" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-all duration-300 ease-in-out bg-black border border-white rounded-lg cursor-pointer border-opacity-30 hover:bg-orange-600 hover:border-orange-600 hover:transition-all hover:duration-300 ">
              <MdLogin className="" size={16} />
              Iniciar sesión
            </Link>

            <Link
              href="/register"
              className="px-4 py-2 text-xs font-semibold transition-all duration-300 ease-in-out bg-orange-600 rounded-lg cursor-pointer hover:bg-white hover:border-orange-600 hover:text-orange-600 hover:transition-all hover:duration-300 "
            >
              Probar gratis
            </Link>
          </div>
        </div>

        {/* MOBILE NAV MENU */}
        <div
          onClick={handleActiveNavBar}
          className="flex items-center justify-center h-16 w-fit md:hidden"
        >
          <RxHamburgerMenu size={25} color="white" />
        </div>

        <div className={active ? styles.overlayActive : styles.overlay}></div>

        <aside className={active ? styles.activeAside : styles.aside}>
          {/* CLOSE BUTTON  */}
          <div
            onClick={handleActiveNavBar}
            className="flex items-center justify-end w-full h-16 md:hidden"
          >
            <RxCross2 size={28} color="white" />
          </div>

          <div className="flex flex-col gap-4 mt-4">
            {/* NAV LINKS */}
            <Link href="/public/search" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-all duration-300 ease-in-out bg-black border border-white rounded-lg cursor-pointer border-opacity-30 hover:bg-orange-600 hover:border-orange-600 hover:transition-all hover:duration-300 ">
              <MdSearch className="" size={16} />
              Buscar negocio
            </Link>

            <Link href="/login" className="flex items-center gap-2 px-3 py-2.5 text-xs font-semibold transition-all duration-300 ease-in-out bg-black border border-white rounded-lg cursor-pointer border-opacity-30 hover:bg-orange-600 hover:border-orange-600 hover:transition-all hover:duration-300 ">
              <MdLogin className="" size={16} />
              Iniciar sesión
            </Link>

            <Link
              href="/register"
              className="w-full px-4 py-2.5 text-xs font-semibold transition-all duration-300 ease-in-out bg-orange-600 rounded-lg cursor-pointer hover:bg-white hover:border-orange-600 hover:text-orange-600 hover:transition-all hover:duration-300 flex justify-center items-center"
            >
              Probar gratis ahora
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
};

export default HeaderPublicBlack;
