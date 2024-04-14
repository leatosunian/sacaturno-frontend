"use client";
import Link from "next/link";
import Image from "next/image";
import { NextPage } from "next";
import { RxHamburgerMenu } from "react-icons/rx";
import { RxCross2 } from "react-icons/rx";
import styles from "../app/css-modules/header.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import sacaturno_logo from '@/public/st_logo_white.png';

interface Props {}

const HeaderPublicBg: NextPage<Props> = ({}) => {
  const [active, setActive] = useState(false);
  const router = useRouter();
  const handleActiveNavBar = () => {
    setActive(!active);
  };
  const closeNavMenu = () => {
    setActive(false);
  };
  const logOut = async () => {
    localStorage.removeItem("sacaturno_userID");
    localStorage.removeItem("sacaturno_token");
    try {
      const res = await fetch("http://localhost:3000/api/logout", {
        method: "POST",
      });
      router.push("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className={` flex justify-between w-full h-16 px-6 text-white md:px-0 md:justify-around position-absolute border-bottom-2 ${styles.publicHeader}`}>
        <div className="flex items-center justify-center h-full gap-1 w-fit ">
          {/* <FcCalendar size={34} />
          <h1 className="text-md">SacaTurno</h1> */}
          <Image className="w-28" src={sacaturno_logo} alt="SacaTurno"/>
        </div>

        <div className="items-center justify-center hidden gap-8 text-sm md:flex">
          <div>
            <Link href="/public/search" className="cursor-pointer">
              Sacar turno
            </Link>
          </div>
          <div>
            <Link href="/login">Iniciar sesión</Link>
          </div>
          <div>
            <Link href="/register">Crear cuenta</Link>
          </div>
          <div
            onClick={logOut}
            className="cursor-pointer ml-7"
            title="Cerrar Sesión"
          >
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
          <div
            onClick={handleActiveNavBar}
            className="flex items-center justify-end w-full h-16 md:hidden"
          >
            <RxCross2 size={28} color="white" />
          </div>
          <Link
            onClick={closeNavMenu}
            className="flex items-center h-12"
            href="/business/search"
          >
            Sacar turno
          </Link>
          <Link
            onClick={closeNavMenu}
            className="flex items-center h-12"
            href="/admin/miempresa"
          >
            Mi empresa
          </Link>
          <Link
            onClick={closeNavMenu}
            className="flex items-center h-12"
            href="/admin/misturnos"
          >
            Mis turnos
          </Link>
          <Link
            onClick={closeNavMenu}
            className="flex items-center h-12"
            href="/admin/perfil"
          >
            Mi perfil
          </Link>
        </aside>
      </div>
    </>
  );
};

export default HeaderPublicBg;
