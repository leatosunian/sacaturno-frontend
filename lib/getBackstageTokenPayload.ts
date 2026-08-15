import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

export interface BackstageTokenPayload {
  adminId: string;
  email: string;
}

export function getBackstageTokenPayload(): BackstageTokenPayload | null {
  const secret = process.env.SUPERADMIN_JWT_SECRET;
  if (!secret) {
    console.error("SUPERADMIN_JWT_SECRET no configurado en el frontend");
    return null;
  }
  const token = cookies().get("sacaturno_hq_token")?.value;
  if (!token) return null;
  try {
    return verify(token, secret) as BackstageTokenPayload;
  } catch {
    return null;
  }
}
