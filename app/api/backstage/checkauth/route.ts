import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

// Sin fallback: acceso de superadmin (analytics de toda la plataforma). Un
// secreto adivinable acá compromete todos los negocios y usuarios.
const superadmin_jwt_secret = process.env.SUPERADMIN_JWT_SECRET;

export async function POST(req: Request) {
  if (!superadmin_jwt_secret) {
    console.error("SUPERADMIN_JWT_SECRET no configurado en el frontend");
    return NextResponse.json("server misconfigured", { status: 500 });
  }

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
