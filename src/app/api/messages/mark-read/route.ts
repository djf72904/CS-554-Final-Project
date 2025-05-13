import { NextResponse } from "next/server"
import { auth } from "@/lib/firebase-admin"
import dbConnect from "@/lib/mongoose"
import Message from "@/models/Message"

export async function POST(req: Request) {
    try {
        const token = req.headers.get("Authorization")?.split("Bearer ")[1]
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const decoded = await auth.verifyIdToken(token)

        const { participantId } = await req.json()

        await dbConnect()

        await Message.updateMany(
            {
                senderId: participantId,
                receiverId: decoded.uid,
                read: false,
            },
            { $set: { read: true } }
        )

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error("Failed to mark messages read:", err)
        return NextResponse.json({ error: "Failed to update" }, { status: 500 })
    }
}
