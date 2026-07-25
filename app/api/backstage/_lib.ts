import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_URL || "http://localhost:4000/api";

export function getHqToken() {
  return cookies().get("sacaturno_hq_token")?.value;
}

// Shared GET proxy for the /backstage endpoints — forwards the platform-admin
// cookie as a Bearer token to the backend, mirroring the analytics proxy
// pattern in app/api/analytics/[businessId]/route.ts.
export async function proxyGet(path: string, searchParams?: URLSearchParams) {
  const token = getHqToken();
  const query = searchParams?.toString();
  const url = `${backendUrl}${path}${query ? `?${query}` : ""}`;

  try {
    const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
    return NextResponse.json(res.data);
  } catch (err: any) {
    const status = err?.response?.status || 500;
    console.error("Backstage proxy error:", path, err?.message);
    return NextResponse.json({ error: "Request failed" }, { status });
  }
}
