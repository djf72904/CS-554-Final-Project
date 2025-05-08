"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"

export default function MessagingPage() {
    const { user } = useAuth()
    const [messages, setMessages] = useState<any[]>([])
    const [input, setInput] = useState("")
    const ws = useRef<WebSocket | null>(null)
    // const [recipientId, setRecipientId] = useState<string | null>(null)

    const recipientId = "klGC7v1eZyQXJQS2cIvB6J2NOI43" //  Replace this with dynamic recipient selection later

    useEffect(() => {
        if (!user) return

        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/messages/${recipientId}`, {
                    headers: {
                        Authorization: `Bearer ${await user.getIdToken()}`,
                    },
                })

                if (!res.ok) throw new Error("Failed to fetch messages")
                const data = await res.json()
                const formattedMessages = data.messages.map((msg: any) => ({
                    from: msg.senderId,
                    to: msg.receiverId,
                    text: msg.text,
                    createdAt: msg.createdAt,
                }))
                setMessages(formattedMessages)
            } catch (err) {
                console.error("❌ Error loading messages:", err)
            }
        }

        fetchMessages()
        const socket = new WebSocket("ws://localhost:3001")
        ws.current = socket

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: "register", uid: user.uid }))
        }

        socket.onmessage = (event) => {
            const { type, message, users } = JSON.parse(event.data)
            if (type === "new_message") {
                setMessages((prev) => [...prev, message])
            }
            // if (type === "online_users") {
            //     const others = users.filter((uid: string) => uid !== user.uid)
            //     if (others.length > 0) setRecipientId(others[0]) // just use the first online user
            // }
        }

        return () => socket.close()
    }, [user])

    const messagesEndRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const sendMessage = async () => {
        if (!input.trim()) return
        if (!user) return

        await fetch("/api/messages/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${await user.getIdToken()}`,
            },
            body: JSON.stringify({
                from: user.uid,
                to: recipientId,
                text: input.trim(),
            }),
        })

        setMessages((prev) => [
            ...prev,
            {
                from: user.uid,
                to: recipientId,
                text: input.trim(),
                createdAt: new Date().toISOString(),
            },
        ])
        setInput("")
    }

    return (
        <div className="max-w-xl mx-auto mt-10">
            <h1 className="text-xl font-semibold mb-4">Chat with {recipientId}</h1>
            <div className="border rounded p-4 h-80 overflow-y-auto bg-white space-y-2 mb-4">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`p-2 rounded ${
                            msg.from === user?.uid ? "bg-blue-100 text-right" : "bg-gray-100 text-left"
                        }`}
                    >
                        <div>{msg.text}</div>
                        <div className="text-xs text-gray-500">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    className="flex-1 border rounded px-2 py-1"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <Button onClick={sendMessage}>Send</Button>
            </div>
        </div>
    )
}
