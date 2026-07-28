import { NextResponse, NextRequest } from "next/server";

// Routes blocked for all employees regardless of permissions (exact match)
const ALWAYS_BLOCKED_FOR_EMPLOYEES = ["/admin/business"];

// Routes that require a specific permission (prefix match)
const PERMISSION_ROUTE_MAP: Record<string, string[]> = {
  view_stats: ["/admin/analytics"],
  manage_schedule: ["/admin/schedule/automate"],
  manage_services: ["/admin/services"],
};

export const middleware = async (req: NextRequest) => {
  const token = req.cookies.get("sacaturno_token");
  const userID = req.cookies.get("sacaturno_userID");
  const pathname = req.nextUrl.pathname;

  if (!token) {
    if (pathname === "/login") return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // Verificar token y leer payload (role viene del JWT firmado, no de cookie)
  const validUser = await fetch(`${req.nextUrl.origin}/api/checkauth`, {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(token.value),
    method: "POST",
  });
  const data = await validUser.json();

  if (!data?.userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Token sin role = token base de login (pre-select-context)
  if (!data?.role && pathname !== "/admin/select-context") {
    return NextResponse.redirect(new URL("/admin/select-context", req.url));
  }

  // Bloquear rutas para empleados según permisos
  if (data?.role === "employee") {
    // Rutas siempre bloqueadas (match exacto para no bloquear sub-rutas como /services)
    if (ALWAYS_BLOCKED_FOR_EMPLOYEES.includes(pathname)) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // Rutas que requieren permiso específico
    const employeePermissions: string[] = data.permissions ?? [];
    for (const [permission, paths] of Object.entries(PERMISSION_ROUTE_MAP)) {
      if (
        paths.some((p) => pathname.startsWith(p)) &&
        !employeePermissions.includes(permission)
      ) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/admin/business",
    "/admin/business/:path*",
    "/admin/services",
    "/admin/services/:path*",
    "/admin/team/:path*",
    "/admin/account/:path*",
    "/admin/dashboard",
    "/admin/profile",
    "/admin/schedule",
    "/admin/schedule/:path*",
    "/admin/analytics",
    "/admin/select-context",
    "/login",
  ],
};
