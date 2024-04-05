import { NextResponse, NextRequest } from "next/server";
import { log } from "console";

export interface NextRequestPathname extends NextRequest {
  pathname: string;
}

export const middleware = async (req: NextRequestPathname, res: NextResponse) => {
  const userID = req.cookies.get("sacaturno_userID");
  const token = req.cookies.get("sacaturno_token");

  /** no token cookie */
  if (req.nextUrl.pathname !== "/login") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  /** prevent login page redirect loop */
  if (!token) {
    if (req.nextUrl.pathname === "/login") {
      return NextResponse.next();
    }
  }
  /** verify token */
  if (token && userID) {
    const validUser = await fetch("/api/checkauth", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(token.value),
      method: "POST",
    });
    const data = await validUser.json();
    if (data.userId === userID.value) {
      /** redirect to dashboard if login page is visited logged in */
      if (req.nextUrl.pathname === "/login") {
        return NextResponse.redirect(new URL("/admin/misturnos", req.url));
      }
      return NextResponse.next();
    }

    console.log("UNEQUAL USER IDS");
    return;
  }
  return NextResponse.redirect(new URL("/login", req.url));
};

export const config = {
  matcher: ["/admin/miempresa", "/admin/perfil", "/admin/misturnos", "/login"],
};
