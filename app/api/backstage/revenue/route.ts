import { NextRequest } from "next/server";
import { proxyGet } from "../_lib";

export async function GET(req: NextRequest) {
  return proxyGet("/superadmin/revenue", req.nextUrl.searchParams);
}
