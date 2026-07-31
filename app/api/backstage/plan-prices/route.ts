import { NextRequest } from "next/server";
import { proxyGet, proxyPut } from "../_lib";

export async function GET() {
  return proxyGet("/superadmin/plan-prices");
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  return proxyPut("/superadmin/plan-prices", body);
}
