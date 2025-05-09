'use server'

import dbConnect from "./mongoose"
import Message from "@/models/Message"
import User, {MongoUserType} from "@/models/User";

export interface MessageType {
    id: string
    text: string
    senderId: string
    receiverId: any
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
            id: newMessage.id,
            text: newMessage.text,
            senderId: newMessage.senderId,
            receiverId: newMessage.receiverId,
            createdAt: newMessage.createdAt,
            updatedAt: newMessage.updatedAt,
        }
    } catch (err) {
        console.error("Error creating message:", err)
        return null
    }
}

export async function getMessagesForUser(
    userId: string,
): Promise<string> {
    await dbConnect()

    const messages = await Message.find({
        $or: [
            { senderId: userId },
            { receiverId: userId }
        ]
    }).sort({ createdAt: 1 }).populate('receiverId', 'users').lean()



    const obj = await Promise.all(messages.map(async (msg)=>{
        const receiver = await User.findOne({uid: msg.receiverId})
        const sender = await User.findOne({uid: msg.senderId})


       return {
           id: msg.id,
           text: msg.text,
           senderId: {
               uid: sender.uid,
               displayName: sender.displayName
           },
           receiverId: {
               uid: receiver.uid,
               displayName: receiver.displayName
           },
           createdAt: msg.createdAt,
           updatedAt: msg.updatedAt,
       }
    }))

    return JSON.stringify(obj.map(msg=>{
        return {
            id: msg.id,
            text: msg.text,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt,
        }
    }))
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
        id: msg.id,
        thread: msg.thread,
        text: msg.text,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
    }))
}
