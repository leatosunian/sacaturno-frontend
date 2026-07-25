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
  HiOutlineWrenchScrewdriver,
  HiOutlineCalendar,
  HiOutlineArrowPath,
  HiOutlinePresentationChartLine,
  HiOutlineMapPin,
  HiOutlineUsers,
  HiOutlineCreditCard,
  HiOutlineBanknotes,
} from "react-icons/hi2";
import styles from "@/app/css-modules/AdminHeader.module.css";
import { getPlanLimits } from "@/lib/planLimits";
import type { SubscriptionType } from "@/lib/planLimits";

interface AdminHeaderProps {
  role?: "owner" | "employee" | null;
  permissions?: string[];
  subscriptionType?: string;
}

export default function AdminHeader({
  role,
  permissions = [],
  subscriptionType,
}: AdminHeaderProps) {
  const isEmployee = role === "employee";
  const can = (p: string) => !isEmployee || permissions.includes(p);
  const planLimits = getPlanLimits(subscriptionType as SubscriptionType | undefined);
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
      <div className="px-6 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/admin/dashboard" onClick={closeMenu}>
            <Image className="w-28" src={sacaturno_logo} alt="SacaTurno" />
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center h-16 w-fit"
            aria-label="Abrir menú"
          >
            <RxHamburgerMenu size={23} color="white" />
          </button>
        </div>
      </div>

      {/* Overlay */}
      <div
        onClick={closeMenu}
        className={isOpen ? styles.overlayActive : styles.overlay}
      />

      {/* Aside */}
      <aside className={isOpen ? styles.activeAside : styles.aside}>
        {/* Header */}
        <div className={styles.asideHeader}>
          <Image className="w-24" src={sacaturno_logo} alt="SacaTurno" />
          <button
            onClick={closeMenu}
            className={styles.closeBtn}
            aria-label="Cerrar menú"
          >
            <RxCross2 size={18} color="rgba(255,255,255,0.65)" />
          </button>
        </div>

        <nav className={styles.asideNav}>
          {/* Inicio */}
          <Link
            onClick={closeMenu}
            className={styles.asideNavItem}
            href="/admin/dashboard"
          >
            <HiOutlineHome size={17} />
            <span>Inicio</span>
          </Link>

          {/* Agenda accordion */}
          <div>
            <button
              onClick={() => toggleDropdown("agenda")}
              className={styles.asideNavItem}
            >
              <HiOutlineCalendarDays size={17} />
              <span>Agenda</span>
              <FaChevronDown
                size={11}
                className={`${styles.asideChevron} ${openDropdown === "agenda" ? styles.asideChevronOpen : ""}`}
              />
            </button>
            {openDropdown === "agenda" && (
              <div className={styles.asideSubNav}>
                <Link
                  onClick={closeMenu}
                  className={styles.asideSubItem}
                  href="/admin/schedule"
                >
                  Turnos
                </Link>
                {can("manage_schedule") && (
                  <Link
                    onClick={closeMenu}
                    className={styles.asideSubItem}
                    href="/admin/schedule/automate"
                  >
                    Automatizar agenda
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Mi empresa accordion — owner only */}
          {!isEmployee && (
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
                  <Link
                    onClick={closeMenu}
                    className={styles.asideSubItem}
                    href="/admin/business"
                  >
                    Datos del negocio
                  </Link>
                  {planLimits.maxBranches > 0 && (
                    <Link
                      onClick={closeMenu}
                      className={styles.asideSubItem}
                      href="/admin/business/branches"
                    >
                      Sucursales
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Servicios — direct link */}
          {(!isEmployee || can("manage_services")) && (
            <Link
              onClick={closeMenu}
              className={styles.asideNavItem}
              href="/admin/services"
            >
              <HiOutlineWrenchScrewdriver size={17} />
              <span>Mis servicios</span>
            </Link>
          )}

          {/* Mi equipo — direct link, owner only */}
          {!isEmployee && planLimits.maxEmployees > 0 && (
            <Link
              onClick={closeMenu}
              className={styles.asideNavItem}
              href="/admin/team/employees"
            >
              <HiOutlineUsers size={17} />
              <span>Mi equipo</span>
            </Link>
          )}

          {/* Métricas — direct link */}
          {(!isEmployee || can("view_stats")) && (
            <Link
              onClick={closeMenu}
              className={styles.asideNavItem}
              href="/admin/analytics"
            >
              <HiOutlinePresentationChartLine size={17} />
              <span>Estadísticas</span>
            </Link>
          )}

          {/* Cuenta accordion (owner) / direct link (employee) */}
          {!isEmployee ? (
            <div>
              <button
                onClick={() => toggleDropdown("cuenta")}
                className={styles.asideNavItem}
              >
                <HiOutlineUser size={17} />
                <span>Cuenta</span>
                <FaChevronDown
                  size={11}
                  className={`${styles.asideChevron} ${openDropdown === "cuenta" ? styles.asideChevronOpen : ""}`}
                />
              </button>
              {openDropdown === "cuenta" && (
                <div className={styles.asideSubNav}>
                  <Link
                    onClick={closeMenu}
                    className={styles.asideSubItem}
                    href="/admin/profile"
                  >
                    Mi perfil
                  </Link>
                  <Link
                    onClick={closeMenu}
                    className={styles.asideSubItem}
                    href="/admin/account/subscription"
                  >
                    Suscripción y facturación
                  </Link>
                  {planLimits.depositsEnabled && (
                    <Link
                      onClick={closeMenu}
                      className={styles.asideSubItem}
                      href="/admin/account/mercadopago"
                    >
                      MercadoPago para señas
                    </Link>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Link
              onClick={closeMenu}
              className={styles.asideNavItem}
              href="/admin/profile"
            >
              <HiOutlineUser size={17} />
              <span>Mi perfil</span>
            </Link>
          )}

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
