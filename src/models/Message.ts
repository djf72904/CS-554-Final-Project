import mongoose, { Schema, type Document } from "mongoose"

export interface IMessage extends Document {
    text: string
    senderId: string
    receiverId: string
    read: boolean
    createdAt: Date
    updatedAt: Date
}

const MessageSchema: Schema = new Schema({
    text: { type: String, required: true },
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

MessageSchema.pre("save", function (next) {
    this.updatedAt = new Date()
    next()
})


export default mongoose?.models?.Message || mongoose.model<IMessage>("Message", MessageSchema)
