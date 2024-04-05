import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest,res: NextResponse) {
    cookies().delete('sacaturno_token')
    cookies().delete('sacaturno_userID')
    return NextResponse.json({msg: 'LOGGED_OUT'})
}