import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";

export async function POST(req: Request, res: NextResponse) {  
  const token = await req.json()
  cookies().set("sacaturno_token", token.token);
  cookies().set('sacaturno_userID', token.userID)
  return NextResponse.json({token})  
}