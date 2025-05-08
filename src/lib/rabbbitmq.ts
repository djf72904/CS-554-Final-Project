import amqp from "amqplib"

let channel: amqp.Channel | null = null
const QUEUE_NAME = "messages"

export async function connectToRabbitMQ() {
    if (channel) return channel
    const connection = await amqp.connect("amqp://localhost")
    channel = await connection.createChannel()
    await channel.assertQueue(QUEUE_NAME, { durable: false })
    return channel
}

export async function sendMessageToQueue(message: any) {
    const ch = await connectToRabbitMQ()
    ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)))
}
