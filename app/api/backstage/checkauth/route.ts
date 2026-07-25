import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

const superadmin_jwt_secret = process.env.SUPERADMIN_JWT_SECRET || "B";

export async function POST(req: Request) {
  const token = await req.json();

  if (!token) {
    return NextResponse.json("no token given");
  }

  try {
    const isValid = verify(token, superadmin_jwt_secret);
    return NextResponse.json(isValid);
  } catch (error) {
    return NextResponse.json("wrong token");
  }
}
