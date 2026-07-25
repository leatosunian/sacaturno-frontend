import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const cookieStore = cookies();
  cookieStore.delete("sacaturno_token");
  cookieStore.delete("sacaturno_userID");
  cookieStore.delete("sacaturno_role");
  cookieStore.delete("sacaturno_context_businessID");
  cookieStore.delete("sacaturno_context_employeeID");
  return NextResponse.json({ msg: "LOGGED_OUT" });
}