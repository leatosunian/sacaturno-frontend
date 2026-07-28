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
  const token = cookies().get("sacaturno_token")?.value;
  if (!token) return null;
  try {
    return verify(token, process.env.JWT_SECRET || "A") as TokenPayload;
  } catch {
    return null;
  }
}
