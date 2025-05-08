const amqp = require("amqplib")
const mongoose = require("mongoose")
const Message = require("../src/models/Message")
const {createMessage} = require("../src/lib/messages")
const MONGO_URI = "mongodb://localhost:27017/test"

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(MONGO_URI)
        console.log("✅ Connected to MongoDB")
    }
}

async function start() {
    await connectDB()

    const conn = await amqp.connect("amqp://localhost")
    const channel = await conn.createChannel()
    const QUEUE = "messages"

    await channel.assertQueue(QUEUE, { durable: false })

    console.log("📩 Waiting for messages...")

    await channel.consume(QUEUE, async (msg: { content: { toString: () => string } } | null) => {
        if (msg !== null) {
            const message = JSON.parse(msg.content.toString())
            console.log("📨 Received message:", message)

            try {
                await createMessage({
                    text: message.text,
                    senderId: message.from,
                    receiverId: message.to,
                })
                console.log("✅ Message saved to DB")
            } catch (error) {
                console.error("❌ Failed to save message:", error)
            }

            channel.ack(msg)
        }
    })
}

start().catch(console.error)
