import { authenticator } from 'otplib';
import User from '@/models/User';
import {decryptSecret, encryptSecret} from "@/lib/crypto";
import dbConnect from "@/lib/mongoose";
import {NextResponse} from "next/server";

export async function POST(req: Request) {
    const aToken = req.headers.get("Authorization")?.split("Bearer ")[1]
    if (!aToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { uid, token } = await req.json();

    await dbConnect();
    const user = await User.findOne({ uid });
    if (!user || !user.totpSecret) return new Response('Unauthorized', { status: 401 });

    const isValid = authenticator.check(token, decryptSecret(user.totpSecret));

    console.log(token, decryptSecret(user.totpSecret))

    if(isValid){
        const encrypted = user.totpSecret;
        await User.updateOne(
            { uid },
            {
                $set: {
                    totpSecret: encrypted,
                    mfaEnabled: true,
                },
            }
        );
    }

    return NextResponse.json({ success: isValid });
}