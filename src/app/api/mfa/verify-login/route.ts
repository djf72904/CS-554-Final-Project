import { authenticator } from 'otplib';
import User from '@/models/User';
import {decryptSecret, encryptSecret} from "@/lib/crypto";
import dbConnect from "@/lib/mongoose";
import {NextResponse} from "next/server";
import {auth} from "@/lib/firebase-admin";

export async function POST(req: Request) {
    const atoken = req.headers.get("Authorization")?.split("Bearer ")[1]

    if (!atoken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await auth.verifyIdToken(atoken)



    const { token } = await req.json();

    await dbConnect();
    const user = await User.findOne({ uid: decoded });
    if (!user || !user.totpSecret) return new Response('Unauthorized', { status: 401 });

    const isValid = authenticator.check(token, decryptSecret(user.totpSecret));

    return NextResponse.json({ success: isValid });
}