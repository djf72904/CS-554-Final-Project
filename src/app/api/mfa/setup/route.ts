import { authenticator } from 'otplib';
// @ts-ignore
import qrcode from 'qrcode';
import User from '@/models/User';
import dbConnect from '@/lib/mongoose';
import { encryptSecret } from '@/lib/crypto';
import {NextResponse} from "next/server";

export async function POST(req: Request) {
    const token = req.headers.get("Authorization")?.split("Bearer ")[1]

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { uid } = await req.json();


    await dbConnect();

    const user = await User.findOne({ uid });
    if (!user) return new Response('User not found', { status: 404 });

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email || uid, 'Campus Bazaar', secret);
    const qr = await qrcode.toDataURL(otpauth);

    try {
        // Ensure these fields exist in your schema: totpSecret, mfaEnabled
        const encrypted = encryptSecret(secret);
        await User.updateOne(
            { uid },
            {
                $set: {
                    totpSecret: encrypted,
                    mfaEnabled: true,
                },
            }
        );

        return Response.json({ qr, secret });
    } catch (error) {
        console.error('Failed to update MFA fields:', error);
        return new Response('Failed to enable MFA', { status: 500 });
    }
}