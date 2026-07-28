import { proxyGet } from "../../_lib";

export async function GET() {
  return proxyGet("/superadmin/subscriptions/expiring");
}
