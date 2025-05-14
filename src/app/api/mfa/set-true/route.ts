import { authenticator } from 'otplib';
import User from '@/models/User';
import {decryptSecret} from "@/lib/crypto";
import dbConnect from "@/lib/mongoose";
import {NextResponse} from "next/server";
import {auth} from "@/lib/firebase-admin";

export async function POST(req: Request) {
    const aToken = req.headers.get("Authorization")?.split("Bearer ")[1]
    if (!aToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await auth.verifyIdToken(aToken)

    await dbConnect();

    await User.updateOne(
        { uid: decoded.uid },
        {
            $set: {
                mfaEnabled: true
            },
        }
    );
    return NextResponse.json({ success: true });
}