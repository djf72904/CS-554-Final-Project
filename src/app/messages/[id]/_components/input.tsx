"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Smile, Paperclip, Send } from "lucide-react"

export default function MessageInput() {
    const [message, setMessage] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (message.trim()) {
            console.log("Sending message:", message)
            setMessage("")
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t bg-white">
            <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border-gray-200 focus-visible:ring-blue-500"
            />
            <Button type="submit" className="rounded-full bg-red-500 hover:bg-red-600">
                <span>Send</span>
            </Button>
        </form>
    )
}
