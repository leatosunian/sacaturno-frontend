"use client";
import { useMemo } from "react";

// hook to get user role from JWT token stored in localStorage
export interface TokenPayload {
  userId: string;
  role?: "owner" | "employee";
  businessID?: string;
  employeeID?: string;
}

function decodeJwtPayload(token: string): TokenPayload | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");

    return JSON.parse(atob(base64)) as TokenPayload;
  } catch {
    return null;
  }
}

// returns the following object:
// {
//   "userId": "string",
//   "role": "owner" | "employee",
//   "businessID": "string",
//   "employeeID": "string"
// }
export function useRole(): TokenPayload | null {
  return useMemo(() => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("sacaturno_token");
    if (!token) return null;
    return decodeJwtPayload(token);
  }, []);
}
