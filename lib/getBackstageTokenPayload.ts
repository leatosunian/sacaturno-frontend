import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

export interface BackstageTokenPayload {
  adminId: string;
  email: string;
}

export function getBackstageTokenPayload(): BackstageTokenPayload | null {
  const token = cookies().get("sacaturno_hq_token")?.value;
  if (!token) return null;
  try {
    return verify(token, process.env.SUPERADMIN_JWT_SECRET || "B") as BackstageTokenPayload;
  } catch {
    return null;
  }
}
