"use client";
import Link from "next/link";
import { NextPage } from "next";
import { IoIosLogOut } from "react-icons/io";
import { RxHamburgerMenu } from "react-icons/rx";
import { RxCross2 } from "react-icons/rx";
import styles from "@/app/css-modules/LoggedInHeader.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import sacaturno_logo from "@/public/st_logo_white.png";

interface Props {}

const LoggedInHeader: NextPage<Props> = ({}) => {
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
      await fetch(`/api/logout`, {
        method: "POST",
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div
        className="flex justify-between w-full h-16 px-6 text-white md:px-0 md:justify-around position-absolute border-bottom-2"
        style={{ backgroundColor: "#060606" }}
      >
        <div className="flex items-center justify-center h-full gap-1 w-fit ">
          <Link href={'/admin/dashboard'}>
          
            <Image className="w-28" src={sacaturno_logo} alt="SacaTurno" />
          </Link>
        </div>

        <div className="items-center justify-center hidden gap-8 text-sm md:flex">
          <div>
            <Link
              href="/public/search"
              className={`cursor-pointer ${styles.navLink}`}
            >
              Sacar turno
            </Link>
          </div>
          <div>
            <Link
              href="/admin/miempresa"
              className={`cursor-pointer ${styles.navLink}`}
            >
              Mi empresa
            </Link>
          </div>
          <div>
            <Link
              href="/admin/misturnos"
              className={`cursor-pointer ${styles.navLink}`}
            >
              Mis turnos
            </Link>
          </div>
          <div>
            <Link
              href="/admin/perfil"
              className={`cursor-pointer ${styles.navLink}`}
            >
              Mi perfil
            </Link>
          </div>
          <div
            onClick={logOut}
            className="cursor-pointer ml-7"
            title="Cerrar Sesión"
          >
            <IoIosLogOut size={22} color="white" />
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
            className="flex items-center h-12 text-xs font-medium uppercase"
            href="/admin/dashboard"
          >
            Inicio
          </Link>
          <Link
            onClick={closeNavMenu}
            className="flex items-center h-12 text-xs font-medium uppercase"
            href="/public/search"
          >
            Sacar turno
          </Link>
          <Link
            onClick={closeNavMenu}
            className="flex items-center h-12 text-xs font-medium uppercase"
            href="/admin/miempresa"
          >
            Mi empresa
          </Link>
          <Link
            onClick={closeNavMenu}
            className="flex items-center h-12 text-xs font-medium uppercase"
            href="/admin/misturnos"
          >
            Mis turnos
          </Link>
          <Link
            onClick={closeNavMenu}
            className="flex items-center h-12 text-xs font-medium uppercase"
            href="/admin/perfil"
          >
            Mi perfil
          </Link>
          <span
            onClick={logOut}
            className="flex items-center h-12 text-xs font-medium uppercase"
          >
            Cerrar sesión
          </span>
        </aside>
      </div>
    </>
  );
};

export default LoggedInHeader;
