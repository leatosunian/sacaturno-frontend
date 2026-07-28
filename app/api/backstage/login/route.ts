import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json();
  const { token } = body as { token: string };

  if (!token) {
    return NextResponse.json({ error: "NO_TOKEN" }, { status: 400 });
  }

  const cookieStore = cookies();
  cookieStore.set("sacaturno_hq_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}
