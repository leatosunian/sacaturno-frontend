import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axiosReq from "@/config/axios";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token")?.value;

  if (!token) return NextResponse.json([], { status: 401 });

  try {
    const res = await axiosReq.get("/employee/my-contexts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(res.data);
  } catch {
    return NextResponse.json([]);
  }
}
