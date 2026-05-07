import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

const backendUrl = process.env.BACKEND_URL || "http://localhost:4000/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: { businessId: string } }
) {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token");
  try {
    const res = await axios.get(
      `${backendUrl}/appointment/analytics/${params.businessId}`,
      { headers: { Authorization: `Bearer ${token?.value}` } }
    );
    return NextResponse.json(res.data);
  } catch (err: any) {
    const status = err?.response?.status || 500;
    console.error("Analytics proxy error:", err?.message);
    return NextResponse.json({ error: "Analytics fetch failed" }, { status });
  }
}
