import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";

interface LoginContext {
  role: "owner" | "employee";
  businessID: string;
  businessName: string;
  employeeID?: string;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { token, userID, contexts } = body as { token: string; userID: string; contexts?: LoginContext[] };

  const cookieStore = cookies();
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  cookieStore.set("sacaturno_token", token, cookieOpts);
  cookieStore.set("sacaturno_userID", userID, cookieOpts);

  // No setear sacaturno_role ni sacaturno_context_businessID aquí.
  // El middleware redirige a /admin/select-context cuando el JWT no tiene role,
  // donde se valida el contexto en el backend y se emite el contextToken.
  const needsContextSelection = Array.isArray(contexts) && contexts.length > 1;

  return NextResponse.json({ token, needsContextSelection });
}
