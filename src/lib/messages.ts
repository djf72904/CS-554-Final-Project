'use server'

import dbConnect from "./mongoose"
import Message from "@/models/Message"

export interface MessageType {
    text: string
    senderId: string
    receiverId: string
    createdAt: Date
    updatedAt: Date
}

export async function createMessage(data: {
    text: string
    senderId: string
    receiverId: string
}): Promise<MessageType | null> {
    await dbConnect()

    try {
        const newMessage = await Message.create({
            text: data.text,
            senderId: data.senderId,
            receiverId: data.receiverId,
        })

        return {
            text: newMessage.text,
            senderId: newMessage.senderId,
            receiverId: newMessage.receiverId,
            createdAt: newMessage.createdAt,
            updatedAt: newMessage.updatedAt,
        }
    } catch (err) {
        console.error("❌ Error creating message:", err)
        return null
    }
}

export async function getMessagesBetweenUsers(
    userA: string,
    userB: string
): Promise<MessageType[]> {
    await dbConnect()

    const messages = await Message.find({
        $or: [
            { senderId: userA, receiverId: userB },
            { senderId: userB, receiverId: userA }
        ]
    }).sort({ createdAt: 1 }).lean()

    return messages.map(msg => ({
        text: msg.text,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
    }))
}
