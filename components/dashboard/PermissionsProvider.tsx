"use client";
import { createContext, useContext } from "react";
import type { EmployeePermission } from "@/interfaces/employee.interface";

interface PermissionsCtx {
  permissions: string[];
  can: (p: EmployeePermission) => boolean;
}

const Ctx = createContext<PermissionsCtx>({ permissions: [], can: () => false });

export function PermissionsProvider({
  permissions,
  children,
}: {
  permissions: string[];
  children: React.ReactNode;
}) {
  return (
    <Ctx.Provider value={{ permissions, can: (p) => permissions.includes(p) }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePermissions(): PermissionsCtx {
  return useContext(Ctx);
}
