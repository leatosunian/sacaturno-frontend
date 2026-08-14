import { NextRequest } from "next/server";
import { proxyPut } from "../../../_lib";

export async function PUT(
  req: NextRequest,
  { params }: { params: { businessId: string } }
) {
  const body = await req.json();
  return proxyPut(`/superadmin/businesses/${params.businessId}/subscription`, body);
}
