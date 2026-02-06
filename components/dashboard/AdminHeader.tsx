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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

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

          <div style={{ zIndex: "9999999" }} className="items-center hidden gap-4 md:flex">

            <Link
              href="/admin/dashboard"
              className="w-fit h-fit"
              onClick={() => {
                setOpenDropdown("");
              }}
            >
              <Button variant="outline" className="text-xs text-white bg-black dark hover:bg-orange-600" >
                Home
              </Button>
            </Link>

            <DropdownMenu onOpenChange={() => toggleDropdown("empresa")}>
              <DropdownMenuTrigger className="text-xs text-white bg-black dark hover:bg-orange-600" asChild>
                <Button variant="outline" className="focus:outline-none ">
                  Mi empresa
                  <BsChevronDown
                    className={` h-4 w-4 transition-transform duration-300 ${openDropdown === "empresa" ? "rotate-180" : ""
                      }`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <Link className="flex items-center w-full gap-2" href="/admin/business">
                  <DropdownMenuItem className="w-full mb-1">
                    <IoIosSettings size={17} />
                    Ajustes
                  </DropdownMenuItem>
                </Link>

                <Link className="flex items-center w-full gap-2" href="/admin/business/settings">
                  <DropdownMenuItem className="w-full">
                    <RiListSettingsLine size={17} className="w-full" />
                    Servicios
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu onOpenChange={() => toggleDropdown("turnos")}>
              <DropdownMenuTrigger className="text-xs text-white bg-black dark hover:bg-orange-600" asChild>
                <Button variant="outline">
                  Mi agenda
                  <BsChevronDown
                    className={` h-4 w-4 transition-transform duration-300 ${openDropdown === "turnos" ? "rotate-180" : ""
                      }`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <Link className="flex items-center w-full gap-2" href="/admin/schedule">
                  <DropdownMenuItem className="w-full mb-1">
                    <LuCalendarPlus size={17} />
                    Agenda de turnos
                  </DropdownMenuItem>
                </Link>

                <Link className="flex items-center w-full gap-2" href="/admin/schedule/settings">
                  <DropdownMenuItem >
                    <TbCalendarRepeat size={18} className="w-full" />
                    Automatizar agenda
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" className="text-xs text-white bg-black dark hover:bg-orange-600" >
              <Link
                href="/admin/profile"
                onClick={() => {
                  setOpenDropdown("");
                }}
              >
                Mi perfil
              </Link>
            </Button>

            <Button onClick={logOut} variant="outline" className="text-xs text-white bg-orange-600 dark hover:bg-white hover:text-orange-600 w-fit" >
                className="flex items-center gap-2"
                onClick={() => {
                  setOpenDropdown("");
                }}
              > <IoIosLogOut size={40} className="font-bold" />
                Cerrar sesión
              </Link>
            </Button>

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
                  className="flex gap-2 px-3 pt-5 pb-3 text-xs font-medium uppercase transition-colors duration-300 rounded-md "
                  onClick={() => setIsOpen(false)}
                >
                  <IoIosSettings size={16} />
                  General
                </Link>
                <Link
                  href="/admin/business/settings"
                  className="flex gap-2 px-3 pt-3 pb-2 text-xs font-medium uppercase transition-colors duration-300 rounded-md "
                  onClick={() => setIsOpen(false)}
                >
                  <RiListSettingsLine size={16} />
                  Servicios
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
                Mi agenda
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
                  className="flex gap-2 px-3 pt-5 pb-3 text-xs font-medium uppercase transition-colors duration-300 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <LuCalendarPlus size={16} />
                  Turnos
                </Link>
                <Link
                  href="/admin/schedule/settings"
                  className="flex gap-2 px-3 pt-3 pb-2 text-xs font-medium uppercase transition-colors duration-300 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <TbCalendarRepeat size={16} />
                  automatizar agenda
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
    </nav >
  );
}
