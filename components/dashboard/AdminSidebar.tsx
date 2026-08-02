"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useNavigationLoading } from "@/app/context/navigationLoadingContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import sacaturno_logo from "@/public/sacaturno-white.svg";
import { getPlanLimits } from "@/lib/planLimits";
import type { SubscriptionType } from "@/lib/planLimits";
import {
  HiOutlineCalendar,
  HiOutlineArrowPath,
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineWrenchScrewdriver,
  HiOutlineUsers,
  HiOutlinePresentationChartLine,
  HiOutlineUser,
  HiOutlineCreditCard,
  HiOutlineBanknotes,
  HiOutlineChevronUpDown,
  HiOutlineExclamationTriangle,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import { IoIosLogOut } from "react-icons/io";
import { SiMercadopago } from "react-icons/si";
import { FaRocket, FaGem, FaMedal } from "react-icons/fa6";
import { MdMoneyOff } from "react-icons/md";

interface AdminSidebarProps {
  role?: "owner" | "employee" | null;
  permissions?: string[];
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  subscriptionPlan?: string;
  subscriptionType?: string;
}

function NavItem({
  href,
  icon: Icon,
  children,
  exactMatch = false,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  exactMatch?: boolean;
}) {
  const pathname = usePathname();
  const { pendingPath } = useNavigationLoading();
  const effectivePath = pendingPath ?? pathname;
  const isActive = exactMatch
    ? effectivePath === href
    : effectivePath === href || effectivePath.startsWith(href + "/");

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className="text-[12px] 2xl:text-[13px] tracking-wider font-medium h-8 2xl:h-9"
      >
        <Link href={href}>
          <Icon size={15} />
          <span>{children}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default function AdminSidebar({
  role,
  permissions = [],
  userName = "",
  userEmail = "",
  userAvatar,
  subscriptionPlan,
  subscriptionType,
}: AdminSidebarProps) {
  const isEmployee = role === "employee";
  const can = (p: string) => !isEmployee || permissions.includes(p);
  const planLimits = getPlanLimits(subscriptionType as SubscriptionType | undefined);
  const router = useRouter();
  const [avatarError, setAvatarError] = useState(false);

  const initial = (userName[0] ?? userEmail[0] ?? "U").toUpperCase();
  const showAvatar = !!userAvatar && !avatarError;

  const logOut = async () => {
    localStorage.removeItem("sacaturno_userID");
    localStorage.removeItem("sacaturno_token");
    try {
      await fetch(`/api/logout`, { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {}
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      {/* Logo */}
      <SidebarHeader className="px-5 h-16 flex-row items-center justify-center border-b border-white/[0.06] shrink-0">
        <Link href="/admin/dashboard">
          <Image className="w-[105px]" src={sacaturno_logo} alt="SacaTurno" />
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2 gap-0">
        {/* Agenda */}
        <SidebarGroup className="py-2">
          <SidebarGroupLabel className="text-white/40 text-[11px] 2xl:text-[12px] mt-1 font-semibold px-2 mb-1 h-auto">
            Agenda
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem
                href="/admin/schedule"
                icon={HiOutlineCalendar}
                exactMatch
              >
                Turnos
              </NavItem>
              {can("manage_schedule") && (
                <NavItem
                  href="/admin/schedule/automate"
                  icon={HiOutlineArrowPath}
                >
                  Automatizar agenda
                </NavItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-white/[0.06] mx-2 my-1" />

        {/* Mi empresa */}
        {!isEmployee && (
          <>
            <SidebarGroup className="py-2">
              <SidebarGroupLabel className="text-white/40 text-[11px] 2xl:text-[12px] mt-1 font-semibold px-2 mb-1 h-auto">
                Mi empresa
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItem
                    href="/admin/business"
                    icon={HiOutlineBuildingOffice2}
                    exactMatch
                  >
                    Configuración
                  </NavItem>
                  {planLimits.maxBranches > 0 && (
                    <NavItem
                      href="/admin/business/branches"
                      icon={HiOutlineMapPin}
                    >
                      Sucursales
                    </NavItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator className="bg-white/[0.06] mx-2" />
          </>
        )}

        {/* Servicios */}
        {(!isEmployee || can("manage_services")) && (
          <>
            <SidebarGroup className="py-2">
              <SidebarGroupLabel className="text-white/40 text-[11px] 2xl:text-[12px] mt-1 font-semibold px-2 mb-1 h-auto">
                Servicios
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItem
                    href="/admin/services"
                    icon={HiOutlineWrenchScrewdriver}
                  >
                    Mis servicios
                  </NavItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator className="bg-white/[0.06] mx-2" />
          </>
        )}

        {/* Mi equipo */}
        {!isEmployee && planLimits.maxEmployees > 0 && (
          <>
            <SidebarGroup className="py-2">
              <SidebarGroupLabel className="text-white/40 text-[11px] 2xl:text-[12px] mt-1 font-semibold px-2 mb-1 h-auto">
                Mi equipo
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItem href="/admin/team/employees" icon={HiOutlineUsers}>
                    Empleados
                  </NavItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator className="bg-white/[0.06] mx-2" />
          </>
        )}

        {/* Métricas */}
        {(!isEmployee || can("view_stats")) && (
          <>
            <SidebarGroup className="py-2">
              <SidebarGroupLabel className="text-white/40 text-[11px] 2xl:text-[12px] mt-1 font-semibold px-2 mb-1 h-auto">
                Métricas
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItem
                    href="/admin/analytics"
                    icon={HiOutlinePresentationChartLine}
                  >
                    Estadísticas
                  </NavItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator className="bg-white/[0.06] mx-2" />
          </>
        )}

        {!isEmployee && planLimits.depositsEnabled && (
          <>
            <SidebarGroup className="py-2">
              <SidebarGroupLabel className="text-white/40 text-[11px] 2xl:text-[12px] mt-1 font-semibold px-2 mb-1 h-auto">
                Integraciones
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItem
                    href="/admin/account/mercadopago"
                    icon={SiMercadopago}
                  >
                    Mercado Pago
                  </NavItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator className="bg-white/[0.06] mx-2" />
          </>
        )}
      </SidebarContent>

      {/* Footer — user account dropdown */}
      <SidebarFooter className="p-2 gap-1.5">
        {!isEmployee && subscriptionPlan && (() => {
          const isExpired = subscriptionType === "SC_EXPIRED";
          const PlanIcon = isExpired
            ? HiOutlineExclamationTriangle
            : subscriptionType === "SC_BASIC"
            ? FaRocket
            : subscriptionType === "SC_PRO"
            ? FaGem
            : subscriptionType === "SC_FULL"
            ? FaMedal
            : MdMoneyOff;

          if (isExpired) {
            return (
              <Link
                href="/admin/account/subscription"
                className="group flex items-center justify-between px-3 py-2.5 rounded-lg bg-red-500/15 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/45 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <PlanIcon size={16} className="text-red-400 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-red-400/60">
                      Tu plan
                    </span>
                    <span className="text-[12px] font-semibold text-red-400">
                      {subscriptionPlan}
                    </span>
                  </div>
                </div>
                <HiOutlineChevronRight
                  size={14}
                  className="text-red-400/50 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </Link>
            );
          }

          return (
            <Link
              href="/admin/account/subscription"
              className="group flex items-center justify-between px-3 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <PlanIcon size={16} className="text-emerald-400 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-white/30">
                    Tu plan
                  </span>
                  <span className="text-[12px] font-semibold text-emerald-400">
                    {subscriptionPlan}
                  </span>
                </div>
              </div>
              <HiOutlineChevronRight
                size={14}
                className="text-emerald-400/40 group-hover:text-emerald-400/90 group-hover:translate-x-0.5 transition-all shrink-0"
              />
            </Link>
          );
        })()}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="bg-white/[0.05] hover:bg-white/[0.08] data-[state=open]:bg-white/10 h-auto py-2 rounded-lg transition-colors"
                >
                  {/* Avatar */}
                  {showAvatar ? (
                    <div className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden ring-1 ring-white/10">
                      <Image
                        src={userAvatar!}
                        alt={userName || userEmail}
                        fill
                        className="object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold">
                      {initial}
                    </div>
                  )}
                  <div className="grid flex-1 text-left text-sm leading-tight gap-px">
                    <span className="truncate text-[12px] font-medium text-white/90">
                      {userName || userEmail}
                    </span>
                    {userName && (
                      <span className="truncate text-[10px] text-white/40">
                        {userEmail}
                      </span>
                    )}
                  </div>
                  <HiOutlineChevronUpDown
                    className="ml-auto text-white/40 shrink-0"
                    size={14}
                  />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="top"
                align="end"
                sideOffset={4}
                onCloseAutoFocus={(e) => e.preventDefault()}
                className="w-56 mb-1 bg-[#0d0d0d] border border-white/[0.06] shadow-2xl"
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-2 py-2.5">
                    {showAvatar ? (
                      <div className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden ring-1 ring-white/10">
                        <Image
                          src={userAvatar!}
                          alt={userName || userEmail}
                          fill
                          className="object-cover"
                          onError={() => setAvatarError(true)}
                        />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold">
                        {initial}
                      </div>
                    )}
                    <div className="grid flex-1 leading-tight gap-px">
                      <span className="truncate text-[12px] font-semibold text-white/90">
                        {userName || userEmail || "Mi cuenta"}
                      </span>
                      {userName && userEmail && (
                        <span className="truncate text-[11px] text-white/35">
                          {userEmail}
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-white/[0.06]" />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push("/admin/profile")}
                    className="uppercase text-[10px] tracking-wider font-medium text-white/50 focus:bg-white/[0.04] focus:text-white/80 cursor-pointer"
                  >
                    <HiOutlineUser size={13} className="text-white/35" />
                    Mi perfil
                  </DropdownMenuItem>
                  {!isEmployee && (
                    <>
                      <DropdownMenuItem
                        onClick={() => router.push("/admin/account/subscription")}
                        className="uppercase text-[10px] tracking-wider font-medium text-white/50 focus:bg-white/[0.04] focus:text-white/80 cursor-pointer"
                      >
                        <HiOutlineCreditCard size={13} className="text-white/35" />
                        Suscripción y facturación
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-white/[0.06]" />

                <DropdownMenuItem
                  onClick={logOut}
                  className="uppercase text-[10px] tracking-wider font-medium text-red-500/70 focus:text-red-400 focus:bg-red-500/[0.06] cursor-pointer"
                >
                  <IoIosLogOut size={13} />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
