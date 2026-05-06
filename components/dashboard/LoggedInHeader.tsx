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
import sacaturno_logo from "@/public/sacaturno-white.svg";
import { FaChevronDown } from "react-icons/fa6";
import {
  HiOutlineBuildingOffice2,
  HiOutlineCalendarDays,
  HiOutlineUser,
  HiOutlineHome,
} from "react-icons/hi2";

interface Props {}

const LoggedInHeader: NextPage<Props> = ({}) => {
  const [active, setActive] = useState(false);
  const [misTurnosOpen, setMisTurnosOpen] = useState(false);
  const router = useRouter();

  const handleActiveNavBar = () => {
    if (active) setMisTurnosOpen(false);
    setActive(!active);
  };

  const closeNavMenu = () => {
    setActive(false);
    setMisTurnosOpen(false);
  };

  const logOut = async () => {
    localStorage.removeItem("sacaturno_userID");
    localStorage.removeItem("sacaturno_token");
    try {
      await fetch(`/api/logout`, { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div
        className="flex justify-between w-full h-16 px-6 text-white md:px-0 md:justify-around"
        style={{ backgroundColor: "#060606" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-full w-fit">
          <Link href="/admin/dashboard">
            <Image className="w-28" src={sacaturno_logo} alt="SacaTurno" />
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="items-center justify-center hidden gap-1 md:flex">
          <Link href="/admin/business" className={`cursor-pointer ${styles.navLink}`}>
            Mi empresa
          </Link>

          {/* Dropdown: Mis turnos */}
          <div className={styles.dropdownNavLink}>
            <div className={`${styles.dropdownTitle} flex gap-1.5 items-center`}>
              <span className={`cursor-pointer ${styles.navLinkNoHover}`}>
                Mis turnos
              </span>
              <FaChevronDown size={9} className={styles.dropdownChevron} />
            </div>
            <div className={styles.options}>
              <Link onClick={closeNavMenu} href="/admin/schedule" className={styles.option}>
                Mi agenda
              </Link>
              <Link onClick={closeNavMenu} href="/admin/schedule/automate" className={styles.option}>
                Configurar agenda
              </Link>
            </div>
          </div>

          <Link href="/admin/profile" className={`cursor-pointer ${styles.navLink}`}>
            Mi perfil
          </Link>

          {/* Divider */}
          <div className="w-px h-5 bg-white opacity-10 mx-3" />

          {/* Logout */}
          <button onClick={logOut} className={styles.logoutBtn} title="Cerrar Sesión">
            <IoIosLogOut size={15} />
            <span>Salir</span>
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={handleActiveNavBar}
          className="flex items-center justify-center h-16 w-fit md:hidden"
          aria-label="Abrir menú"
        >
          <RxHamburgerMenu size={23} color="white" />
        </button>

        {/* Overlay */}
        <div
          onClick={closeNavMenu}
          className={active ? styles.overlayActive : styles.overlay}
        />

        {/* Mobile aside */}
        <aside className={active ? styles.activeAside : styles.aside}>
          {/* Header */}
          <div className={styles.asideHeader}>
            <Image className="w-24" src={sacaturno_logo} alt="SacaTurno" />
            <button
              onClick={handleActiveNavBar}
              className={styles.closeBtn}
              aria-label="Cerrar menú"
            >
              <RxCross2 size={18} color="rgba(255,255,255,0.65)" />
            </button>
          </div>

          {/* Nav items */}
          <nav className={styles.asideNav}>
            <Link onClick={closeNavMenu} className={styles.asideNavItem} href="/admin/dashboard">
              <HiOutlineHome size={17} />
              <span>Inicio</span>
            </Link>

            <Link onClick={closeNavMenu} className={styles.asideNavItem} href="/admin/business">
              <HiOutlineBuildingOffice2 size={17} />
              <span>Mi empresa</span>
            </Link>

            {/* Accordion: Mis turnos */}
            <div>
              <button
                onClick={() => setMisTurnosOpen(!misTurnosOpen)}
                className={styles.asideNavItem}
              >
                <HiOutlineCalendarDays size={17} />
                <span>Mis turnos</span>
                <FaChevronDown
                  size={11}
                  className={`${styles.asideChevron} ${misTurnosOpen ? styles.asideChevronOpen : ""}`}
                />
              </button>
              {misTurnosOpen && (
                <div className={styles.asideSubNav}>
                  <Link onClick={closeNavMenu} className={styles.asideSubItem} href="/admin/schedule">
                    Mi agenda
                  </Link>
                  <Link onClick={closeNavMenu} className={styles.asideSubItem} href="/admin/schedule/automate">
                    Configurar agenda
                  </Link>
                </div>
              )}
            </div>

            <Link onClick={closeNavMenu} className={styles.asideNavItem} href="/admin/profile">
              <HiOutlineUser size={17} />
              <span>Mi perfil</span>
            </Link>

            <div className={styles.asideSeparator} />

            <button onClick={logOut} className={styles.asideLogout}>
              <IoIosLogOut size={17} />
              <span>Cerrar sesión</span>
            </button>
          </nav>
        </aside>
      </div>
    </>
  );
};

export default LoggedInHeader;
