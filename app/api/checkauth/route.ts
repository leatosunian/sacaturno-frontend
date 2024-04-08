import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { log } from "console";
const jwt_secret = process.env.JWT_SECRET || "A";

export async function POST(req: NextRequest, res: NextResponse) {
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
