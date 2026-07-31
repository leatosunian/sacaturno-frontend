import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axiosReq from "@/config/axios";

export async function POST(req: Request) {
  const { role, businessID, employeeID } = await req.json();

  const cookieStore = cookies();
  const currentToken = cookieStore.get("sacaturno_token")?.value;
  if (!currentToken) return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });

  try {
    const res = await axiosReq.post(
      "/employee/select-context",
      { role, businessID, employeeID },
      { headers: { Authorization: `Bearer ${currentToken}` } }
    );

    const { contextToken } = res.data;

    cookieStore.set("sacaturno_token", contextToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 días, alineado al expiry del JWT
    });

    // Eliminar cookies de contexto sueltas (ya no son necesarias)
    cookieStore.delete("sacaturno_role");
    cookieStore.delete("sacaturno_context_businessID");
    cookieStore.delete("sacaturno_context_employeeID");

    // Devolver contextToken para que el frontend actualice localStorage
    return NextResponse.json({ success: true, contextToken });
  } catch {
    return NextResponse.json({ error: "CONTEXT_NOT_AUTHORIZED" }, { status: 403 });
  }
}
