"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type Crumb = { label: string; href?: string };

const ROUTE_MAP: Record<string, Crumb[]> = {
  "/admin/dashboard": [{ label: "inicio" }],
  "/admin/schedule": [{ label: "agenda" }, { label: "turnos" }],
  "/admin/schedule/automate": [
    { label: "agenda", href: "/admin/schedule" },
    { label: "automatizar agenda" },
  ],
  "/admin/business": [{ label: "mi empresa" }, { label: "datos del negocio" }],
  "/admin/business/create": [
    { label: "mi empresa", href: "/admin/business" },
    { label: "crear negocio" },
  ],
  "/admin/business/branches": [
    { label: "mi empresa", href: "/admin/business" },
    { label: "sucursales" },
  ],
  "/admin/services": [{ label: "servicios" }, { label: "mis servicios" }],
  "/admin/team/employees": [{ label: "mi equipo" }, { label: "empleados" }],
  "/admin/analytics": [{ label: "métricas" }, { label: "estadísticas" }],
  "/admin/account/mercadopago": [
    { label: "integraciones" },
    { label: "mercado pago" },
  ],
  "/admin/account/subscription": [
    { label: "cuenta" },
    { label: "suscripción y facturación" },
  ],
  "/admin/profile": [{ label: "cuenta" }, { label: "mi perfil" }],
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function AdminBreadcrumbs() {
  const pathname = usePathname();
  const crumbs = ROUTE_MAP[pathname];

  if (!crumbs?.length) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs gap-1.5 sm:gap-1.5 flex-nowrap">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <React.Fragment key={crumb.label}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-xs font-semibold text-primary">
                    {cap(crumb.label)}
                  </BreadcrumbPage>
                ) : crumb.href ? (
                  <BreadcrumbLink asChild className="text-xs">
                    <Link href={crumb.href}>{cap(crumb.label)}</Link>
                  </BreadcrumbLink>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {cap(crumb.label)}
                  </span>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
