"use client";
import Link from "next/link";
import { NextPage } from "next";
import { RxHamburgerMenu } from "react-icons/rx";
import { RxCross2 } from "react-icons/rx";
import styles from "../app/css-modules/header.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import sacaturno_logo from "@/public/st_logo_white.png";

interface Props {}

const HeaderPublic: NextPage<Props> = ({}) => {
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
          <Image className="w-28" src={sacaturno_logo} alt="SacaTurno" />
        </div>

        <div className="items-center justify-center hidden gap-8 text-sm md:flex">
          <div>
            <Link href="/public/search" className={`cursor-pointer ${styles.navLink}`}>
              reservar turno
            </Link>
          </div>
          <div>
            <Link href="/login" className={`cursor-pointer ${styles.navLink}`}>Iniciar sesión</Link>
          </div>
          <div>
            <Link href="/register" className={`cursor-pointer ${styles.navLink}`}>registrarme</Link>
          </div>
          <div>
            <Link href="/login" className={`cursor-pointer ${styles.navLink}`}>contactanos</Link>
          </div>
          <div
            onClick={logOut}
            className="cursor-pointer ml-7"
            title="Cerrar Sesión"
          ></div>
        </div>

        {/* MOBILE NAV MENU */}
        <div
          onClick={handleActiveNavBar}
          className="flex items-center justify-center h-16 w-fit md:hidden"
        >
          <RxHamburgerMenu size={25} color="white" />
        </div>

        <div className={active ? styles.overlayActive : styles.overlay}></div>

        <aside  className={active ? styles.activeAside : styles.aside}>
          <div
            onClick={handleActiveNavBar}
            className="flex items-center justify-end w-full h-16 md:hidden"
          >
            <RxCross2 size={28} color="white" />
          </div>
          <Link
            onClick={closeNavMenu}
            className="flex items-center h-12 text-xs font-medium uppercase"
            href="/public/search"
          >
            reservar turno
          </Link>
          <Link
            onClick={closeNavMenu}
            className="flex items-center h-12 text-xs font-medium uppercase"
            href="/login"
          >
            Iniciar sesión
          </Link>
          <Link
            onClick={closeNavMenu}
            className="flex items-center h-12 text-xs font-medium uppercase"
            href="/register"
          >
            Registrarme
          </Link>
          <Link
            onClick={closeNavMenu}
            className="flex items-center h-12 text-xs font-medium uppercase"
            href="/register"
          >
            contactanos
          </Link>
        </aside>
      </div>
    </>
  );
};

export default HeaderPublic;
