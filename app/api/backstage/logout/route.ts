import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  cookies().delete("sacaturno_hq_token");
  return NextResponse.json({ msg: "LOGGED_OUT" });
}
