"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BsChevronDown } from "react-icons/bs";
import Image from "next/image";
import {
  CiAlarmOn,
  CiCalendarDate,
  CiLogout,
  CiShop,
  CiUser,
} from "react-icons/ci";
import sacaturno_logo from "@/public/st_logo_white.png";
import { RxCross2, RxHamburgerMenu } from "react-icons/rx";
import { useRouter } from "next/navigation";
import { IoIosLogOut, IoIosSettings } from "react-icons/io";
import { RiListSettingsLine } from "react-icons/ri";
import { LuCalendarPlus } from "react-icons/lu";
import { TbCalendarRepeat } from "react-icons/tb";

export default function AdminHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState("");

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? "" : dropdown);
  };
  const router = useRouter();

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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // close submenus
    if (!isOpen) {
      setOpenDropdown("");
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <nav className="text-white bg-black">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8 lg:px-14">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link
                href={"/admin/dashboard"}
                onClick={() => {
                  setIsOpen(false);
                  setOpenDropdown("");
                }}
              >
                <Image className="w-28" src={sacaturno_logo} alt="SacaTurno" />
              </Link>
            </div>
          </div>
          <div
            style={{
              zIndex: "9999999"
            }}
            className="hidden md:block"
          >
            <div className="flex items-baseline ml-10 space-x-4">
              <div className="relative group" style={{ zIndex: '99999' }} >
                <Link
                  href="/admin/dashboard"
                  className="px-3 py-2 mr-5 text-xs font-medium uppercase transition-colors duration-300 rounded-md backgroundOrangHover"
                  onClick={() => {
                    setOpenDropdown("");
                  }}
                >
                  Home
                </Link>
                <button
                  onClick={() => toggleDropdown("empresa")}
                  className="inline-flex items-center px-3 py-2 text-xs font-medium uppercase transition-colors duration-300 rounded-md backgroundOrangHover"
                >
                  Mi empresa
                  <BsChevronDown
                    className={`ml-1 h-4 w-4 transition-transform duration-300 ${openDropdown === "empresa" ? "rotate-180" : ""
                      }`}
                  />
                </button>
                <div
                  style={{ outline: "1px solid rgba(255, 255, 255, 0.24)" }}
                  className={`absolute left-4 mt-2 w-48 bg-black backdrop-blur-md bg-opacity-50 rounded-md shadow-lg  z-10 transition-all duration-300 ${openDropdown === "empresa"
                    ? "opacity-100 translate-y-0 "
                    : "opacity-0 -translate-y-2 pointer-events-none "
                    }`}
                >
                  <Link
                    href="/admin/business"
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                    className="flex items-center gap-2 px-4 py-3 text-xs uppercase transition-colors duration-300 rounded-t-md backgroundOrangHover"
                    onClick={() => {
                      setOpenDropdown("");
                    }}
                  >
                    <IoIosSettings size={16} />
                    General
                  </Link>
                  <Link
                    href="/admin/business/settings"
                    className="flex items-center gap-2 px-4 py-3 text-xs uppercase transition-colors duration-300 backgroundOrangHover rounded-b-md"
                    onClick={() => {
                      setOpenDropdown("");
                    }}
                  >
                    <RiListSettingsLine size={16}/>

                    Servicios
                  </Link>
                </div>
              </div>
              <div className="relative group" style={{ zIndex: '99999' }} >
                <button
                  onClick={() => toggleDropdown("turnos")}
                  className="inline-flex items-center px-3 py-2 text-xs font-medium uppercase transition-colors duration-300 rounded-md backgroundOrangHover"
                >
                  Mi agenda
                  <BsChevronDown
                    className={`ml-1 h-4 w-4 transition-transform duration-300 ${openDropdown === "turnos" ? "rotate-180" : ""
                      }`}
                  />
                </button>
                <div
                  style={{ outline: "1px solid rgba(255, 255, 255, 0.24)" }}
                  className={`absolute left-0 mt-2 w-48 bg-black backdrop-blur-md bg-opacity-50 rounded-md shadow-lg  z-10 transition-all duration-300 ${openDropdown === "turnos"
                    ? "opacity-100 translate-y-0 "
                    : "opacity-0 -translate-y-2 pointer-events-none "
                    }`}
                >
                  <Link
                    href="/admin/schedule"
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                    className="flex items-center gap-2 px-4 py-3 text-xs uppercase transition-colors duration-300 rounded-t-md backgroundOrangHover"
                    onClick={() => {
                      setOpenDropdown("");
                    }}
                  >
                    <LuCalendarPlus  size={16} />
                    Turnos
                  </Link>
                  <Link
                    href="/admin/schedule/settings"
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                    className="flex items-center gap-2 px-4 py-3 text-xs uppercase transition-colors duration-300 rounded-b-md backgroundOrangHover"
                    onClick={() => {
                      setOpenDropdown("");
                    }}
                  >
                    <TbCalendarRepeat  size={16} />
                    automatizar
                  </Link>
                </div>
              </div>
              <Link
                href="/admin/profile"
                className="px-3 py-2 text-xs font-medium uppercase transition-colors duration-300 rounded-md backgroundOrangHover"
                onClick={() => {
                  setOpenDropdown("");
                }}
              >
                Mi perfil
              </Link>
              <div
                onClick={logOut}
                className="my-auto cursor-pointer"
                style={{ marginLeft: "35px" }}
                title="Cerrar Sesión"
              >
                <IoIosLogOut size={22} color="white" />
              </div>
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md "
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <RxCross2 size={28} color="white" />
              ) : (
                <RxHamburgerMenu
                  size={25}
                  color="white"
                  className="block w-6 h-6"
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div
        style={{
          transform: "translateY(63px)",
          zIndex: "9999999",
        }}
        className={` fixed inset-0 z-50 md:hidden transition-opacity duration-300 ease-in-out ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        {/* Blurred background */}
        <div
          className="absolute inset-0 bg-black bg-opacity-65 "
          onClick={() => setIsOpen(false)}
        ></div>

        {/* Menu content */}
        <div
          className={`absolute top-0 pt-2 right-0 w-64 h-full bg-black bg-opacity-90 shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/public/search"
              className="flex items-center gap-2 px-3 py-3 text-sm font-medium uppercase transition-colors duration-300 rounded-md backgroundOrangHover"
              onClick={() => setIsOpen(false)}
            >
              <CiAlarmOn size={16} />
              Sacar turno
            </Link>
            <div>
              <button
                onClick={() => toggleDropdown("empresa")}
                className={`"backgroundOrangHover px-3 py-3 rounded-md w-full text-sm font-medium uppercase transition-colors duration-300 flex gap-2 items-center ${openDropdown === "empresa" ? "backgroundOrange" : "bg-black"
                  }`}
              >
                <CiShop size={16} />
                Mi empresa
                <BsChevronDown
                  className={`h-4 w-4 ml-auto transition-transform duration-300 ${openDropdown === "empresa" ? "rotate-180" : ""
                    }`}
                />
              </button>
              <div
                className={`pl-5 transition-all duration-300 ${openDropdown === "empresa"
                  ? "max-h-40 opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden"
                  }`}
              >
                <Link
                  href="/admin/business"
                  className="flex px-3 pt-5 pb-3 text-xs font-medium uppercase transition-colors duration-300 rounded-md "
                  onClick={() => setIsOpen(false)}
                >
                  Configurar empresa
                </Link>
                <Link
                  href="/admin/business/settings"
                  className="flex px-3 pt-3 pb-2 text-xs font-medium uppercase transition-colors duration-300 rounded-md "
                  onClick={() => setIsOpen(false)}
                >
                  Mis servicios
                </Link>
              </div>
            </div>
            <div>
              <button
                onClick={() => toggleDropdown("turnos")}
                className={`backgroundOrangHover px-3 py-3 rounded-md w-full text-sm font-medium uppercase transition-colors duration-300 flex gap-2 items-center ${openDropdown === "turnos" ? "backgroundOrange" : "bg-black"
                  }`}
              >
                <CiCalendarDate size={16} />
                Mis turnos
                <BsChevronDown
                  className={`h-4 w-4 ml-auto  transition-transform duration-300 ${openDropdown === "turnos" ? "rotate-180" : ""
                    }`}
                />
              </button>
              <div
                className={`pl-6 transition-all duration-300 ${openDropdown === "turnos"
                  ? "max-h-40 opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden"
                  }`}
              >
                <Link
                  href="/admin/schedule"
                  className="block px-3 pt-5 pb-3 text-xs font-medium uppercase transition-colors duration-300 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Mi agenda
                </Link>
                <Link
                  href="/admin/schedule/settings"
                  className="block px-3 pt-3 pb-2 text-xs font-medium uppercase transition-colors duration-300 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Configurar agenda
                </Link>
              </div>
            </div>
            <Link
              href="/admin/profile"
              className="flex items-center gap-2 px-3 py-3 text-sm font-medium uppercase transition-colors duration-300 rounded-md backgroundOrangHover"
              onClick={() => setIsOpen(false)}
            >
              <CiUser size={16} />
              Mi perfil
            </Link>
            <span
              onClick={() => {
                logOut();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-3 text-sm font-medium uppercase transition-colors duration-300 rounded-md backgroundOrangHover"
            >
              <CiLogout size={16} />
              Cerrar sesión
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
