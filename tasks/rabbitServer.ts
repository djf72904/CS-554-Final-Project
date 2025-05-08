const amqp = require("amqplib")
const mongoose = require("mongoose")
const { createMessage } = require("../src/lib/messages")
const { WebSocketServer } = require("ws")
const { createServer } = require("http")

const MONGO_URI = "mongodb://localhost:27017/test"
const PORT = 3001

// Track connected users: uid -> WebSocket
const clients = new Map<string, any>()

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(MONGO_URI)
        console.log("✅ Connected to MongoDB")
    }
}

async function startRabbitConsumer() {
    const conn = await amqp.connect("amqp://localhost")
    const channel = await conn.createChannel()
    const QUEUE = "messages"

    await channel.assertQueue(QUEUE, { durable: false })

    console.log("📩 Waiting for messages from RabbitMQ...")

    await channel.consume(QUEUE, async (msg: { content: { toString: () => string } } | null) => {
        if (msg !== null) {
            const message = JSON.parse(msg.content.toString())
            console.log("📨 Received:", message)

            try {
                await createMessage({
                    text: message.text,
                    senderId: message.from,
                    receiverId: message.to,
                })

                console.log("✅ Saved to DB")

                // Notify recipient if online
                const recipientSocket = clients.get(message.to)
                if (recipientSocket && recipientSocket.readyState === 1) {
                    recipientSocket.send(JSON.stringify({ type: "new_message", message }))
                    console.log(`📤 Delivered to user ${message.to}`)
                }
            } catch (error) {
                console.error("❌ Failed to save or notify:", error)
            }

            channel.ack(msg)
        }
    })
}

function startWebSocketServer() {
    const server = createServer()
    const wss = new WebSocketServer({ server })

    wss.on("connection", (ws: { on: (arg0: string, arg1: (data: any) => void) => void }) => {
        ws.on("message", (data) => {
            const msg = JSON.parse(data.toString())
            if (msg.type === "register" && msg.uid) {
                clients.set(msg.uid, ws)
                console.log(`🟢 ${msg.uid} connected`)
            }
        })

        ws.on("close", () => {
            for (const [uid, socket] of clients.entries()) {
                if (socket === ws) {
                    clients.delete(uid)
                    console.log(`🔴 ${uid} disconnected`)
                    break
                }
            }
        })
    })

    server.listen(PORT, () => {
        console.log(`📡 WebSocket server listening at ws://localhost:${PORT}`)
    })
}

async function main() {
    await connectDB()
    startWebSocketServer()
    await startRabbitConsumer()
}

main().catch(console.error)
