"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import sacaturno_logo from "@/public/sacaturno-white.svg";
import { RxCross2, RxHamburgerMenu } from "react-icons/rx";
import { useRouter } from "next/navigation";
import { IoIosLogOut } from "react-icons/io";
import { FaChevronDown } from "react-icons/fa6";
import {
  HiOutlineBuildingOffice2,
  HiOutlineCalendarDays,
  HiOutlineUser,
  HiOutlineHome,
  HiOutlineCog6Tooth,
  HiOutlineWrenchScrewdriver,
  HiOutlineCalendar,
  HiOutlineArrowPath,
} from "react-icons/hi2";
import styles from "@/app/css-modules/AdminHeader.module.css";

export default function AdminHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState("");
  const router = useRouter();

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? "" : dropdown);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setOpenDropdown("");
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

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    if (!isOpen) setOpenDropdown("");
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <nav style={{ backgroundColor: "#060606" }} className="text-white w-full">
      <div className="px-6 mx-auto max-w-7xl md:px-8 lg:px-14">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/admin/dashboard" onClick={closeMenu}>
            <Image className="w-28" src={sacaturno_logo} alt="SacaTurno" />
          </Link>

          {/* Desktop nav */}
          <div className="items-center hidden gap-1 md:flex">

            <Link
              href="/admin/dashboard"
              onClick={() => setOpenDropdown("")}
              className={styles.navLink}
            >
              Inicio
            </Link>

            {/* Mi agenda dropdown */}
            <div className={styles.dropdownNavLink}>
              <div className={`${styles.dropdownTitle} flex gap-1.5 items-center`}>
                <span className={styles.navLinkNoHover}>Mi agenda</span>
                <FaChevronDown size={9} className={styles.dropdownChevron} />
              </div>
              <div className={styles.options}>
                <Link href="/admin/schedule" className={styles.option}>
                  <HiOutlineCalendar size={13} />
                  Agenda de turnos
                </Link>
                <Link href="/admin/schedule/automate" className={styles.option}>
                  <HiOutlineArrowPath size={13} />
                  Automatizar agenda
                </Link>
              </div>
            </div>

            {/* Mi empresa dropdown */}
            <div className={styles.dropdownNavLink}>
              <div className={`${styles.dropdownTitle} flex gap-1.5 items-center`}>
                <span className={styles.navLinkNoHover}>Mi empresa</span>
                <FaChevronDown size={9} className={styles.dropdownChevron} />
              </div>
              <div className={styles.options}>
                <Link href="/admin/business" className={styles.option}>
                  <HiOutlineCog6Tooth size={13} />
                  Ajustes
                </Link>
                <Link href="/admin/business/services" className={styles.option}>
                  <HiOutlineWrenchScrewdriver size={13} />
                  Servicios
                </Link>
              </div>
            </div>

            <Link
              href="/admin/profile"
              onClick={() => setOpenDropdown("")}
              className={styles.navLink}
            >
              Mi perfil
            </Link>

            {/* Divider */}
            <div className="w-px h-5 bg-white opacity-10 mx-3" />

            {/* Logout */}
            <button onClick={logOut} className={styles.logoutBtn}>
              <IoIosLogOut size={15} />
              <span>Salir</span>
            </button>

          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center h-16 w-fit md:hidden"
            aria-label="Abrir menú"
          >
            <RxHamburgerMenu size={23} color="white" />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        onClick={closeMenu}
        className={isOpen ? styles.overlayActive : styles.overlay}
      />

      {/* Mobile aside */}
      <aside className={isOpen ? styles.activeAside : styles.aside}>

        {/* Header */}
        <div className={styles.asideHeader}>
          <Image className="w-24" src={sacaturno_logo} alt="SacaTurno" />
          <button onClick={closeMenu} className={styles.closeBtn} aria-label="Cerrar menú">
            <RxCross2 size={18} color="rgba(255,255,255,0.65)" />
          </button>
        </div>

        {/* Nav items */}
        <nav className={styles.asideNav}>

          <Link onClick={closeMenu} className={styles.asideNavItem} href="/admin/dashboard">
            <HiOutlineHome size={17} />
            <span>Inicio</span>
          </Link>

          {/* Mi agenda accordion */}
          <div>
            <button
              onClick={() => toggleDropdown("turnos")}
              className={styles.asideNavItem}
            >
              <HiOutlineCalendarDays size={17} />
              <span>Mi agenda</span>
              <FaChevronDown
                size={11}
                className={`${styles.asideChevron} ${openDropdown === "turnos" ? styles.asideChevronOpen : ""}`}
              />
            </button>
            {openDropdown === "turnos" && (
              <div className={styles.asideSubNav}>
                <Link onClick={closeMenu} className={styles.asideSubItem} href="/admin/schedule">
                  Agenda de turnos
                </Link>
                <Link onClick={closeMenu} className={styles.asideSubItem} href="/admin/schedule/automate">
                  Automatizar agenda
                </Link>
              </div>
            )}
          </div>

          {/* Mi empresa accordion */}
          <div>
            <button
              onClick={() => toggleDropdown("empresa")}
              className={styles.asideNavItem}
            >
              <HiOutlineBuildingOffice2 size={17} />
              <span>Mi empresa</span>
              <FaChevronDown
                size={11}
                className={`${styles.asideChevron} ${openDropdown === "empresa" ? styles.asideChevronOpen : ""}`}
              />
            </button>
            {openDropdown === "empresa" && (
              <div className={styles.asideSubNav}>
                <Link onClick={closeMenu} className={styles.asideSubItem} href="/admin/business">
                  Ajustes
                </Link>
                <Link onClick={closeMenu} className={styles.asideSubItem} href="/admin/business/services">
                  Servicios
                </Link>
              </div>
            )}
          </div>

          <Link onClick={closeMenu} className={styles.asideNavItem} href="/admin/profile">
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
    </nav>
  );
}
