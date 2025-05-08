import { NextResponse } from "next/server"
import { sendMessageToQueue } from "@/lib/rabbbitmq"
import { auth } from "@/lib/firebase-admin"

export async function POST(req: Request) {
    const token = req.headers.get("Authorization")?.split("Bearer ")[1]
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const decoded = await auth.verifyIdToken(token)
        const body = await req.json()

        const message = {
            from: decoded.uid,
            to: body.to,
            text: body.text,
        }

        await sendMessageToQueue(message)

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error("❌ API route error:", err)
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }
}