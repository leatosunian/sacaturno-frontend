import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

export interface TokenPayload {
  userId: string;
  role?: "owner" | "employee";
  businessID?: string;
  employeeID?: string;
  permissions?: string[];
}

export function getTokenPayload(): TokenPayload | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET no configurado en el frontend");
    return null;
  }
  const token = cookies().get("sacaturno_token")?.value;
  if (!token) return null;
  try {
    return verify(token, secret) as TokenPayload;
  } catch {
    return null;
  }
}
