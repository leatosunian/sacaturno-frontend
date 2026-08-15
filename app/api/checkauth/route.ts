import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

// Sin fallback: si el secreto no está configurado no verificamos contra un valor
// adivinable, devolvemos 500. Debe coincidir con el JWT_SECRET del backend.
const jwt_secret = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
  if (!jwt_secret) {
    console.error("JWT_SECRET no configurado en el frontend");
    return NextResponse.json("server misconfigured", { status: 500 });
  }

  const token = await req.json();

  if (token) {
    try {
      const isValid = verify(token, jwt_secret);
      return NextResponse.json(isValid);
    } catch (error) {
      return NextResponse.json("wrong token");
    }
  } else {
    return NextResponse.json("no token given");
  }
}
