import amqp from "amqplib"
import mongoose from "mongoose"
import {createMessage} from "@/lib/messages"
import { WebSocketServer, WebSocket } from "ws";
import {createServer} from "http";
import url from "url";

const MONGO_URI = "mongodb://localhost:27017/test"
async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(MONGO_URI)
        console.log("Connected to MongoDB")
    }
}

async function start() {
    await connectDB()

    //websocket
    const server = createServer()
    const wss = new WebSocketServer({ server })
    const clients = new Map<string, WebSocket>();

    wss.on("connection", (ws: WebSocket, req: { url: any }) => {
        const queryParams = url.parse(req.url || "", true).query;
        const userId = queryParams.userId as string;

        console.log("Client connected to WebSocket");
        clients.set(userId, ws);
        console.log("connected")
        ws.on("close", () => {
            console.log("Client disconnected");
            clients.delete(userId);
        });
    });

    server.listen(4000, () => {
        console.log("WebSocket server running on port 4000");
    });

    //rabbit
    const conn = await amqp.connect("amqp://localhost")
    const channel = await conn.createChannel()
    const QUEUE = "messages"

    await channel.assertQueue(QUEUE, { durable: false })

    console.log("Waiting for messages...")

    await channel.consume(QUEUE, async (msg: any | null) => {
        if (msg !== null) {
            const message = JSON.parse(msg.content.toString())
            console.log("Received message:", message)

            try {
                const savedMessage = await createMessage({
                    text: message.text,
                    senderId: message.from,
                    receiverId: message.to,
                    read: false,
                });

                const payload = JSON.stringify({
                    type: "new_message",
                    message: savedMessage,
                });

                const receiverSocket = clients.get(message.to);
                if (receiverSocket) {
                    receiverSocket.send(payload);
                    console.log(`Message instantly delivered to ${message.to}`);
                } else {
                    // Receiver not connected; simply log and continue
                    console.log(`Receiver ${message.to} not currently connected. Message still saved.`);
                }
            } catch (error) {
                console.error("Failed to save message:", error)
            }


            channel.ack(msg)
        }
    })
}

start().catch(console.error)