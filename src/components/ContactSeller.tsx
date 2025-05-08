"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"

export default function ContactSeller({ sellerId }: { sellerId: string }) {
    const { user } = useAuth()
    const [message, setMessage] = useState("")
    const [sending, setSending] = useState(false)

    const handleSend = async () => {
        if (!user) return alert("Please log in to contact the seller")
        if (!message.trim()) return alert("Message cannot be empty")

        setSending(true)

        try {
            await fetch("/api/messages/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${await user.getIdToken()}`,
                },
                body: JSON.stringify({
                    from: user.uid,
                    to: sellerId,
                    text: message.trim(),
                }),
            })

            alert("Message sent!")
            setMessage("")
        } catch (error) {
            console.error("Failed to send message", error)
            alert("Something went wrong.")
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="space-y-2 mt-4">
      <textarea
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="Write a message to the seller..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
      />
            <Button className="w-full" onClick={handleSend} disabled={sending}>
                {sending ? "Sending..." : "Send Message"}
            </Button>
        </div>
    )
}
