import { NextRequest } from "next/server";
import { proxyGet } from "../../_lib";

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  return proxyGet(`/superadmin/users/${params.userId}`);
}
