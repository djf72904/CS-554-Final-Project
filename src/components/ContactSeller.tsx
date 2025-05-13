"use client"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import {useRouter} from "next/navigation";
import {useState} from "react";

export default function ContactSeller({ sellerId }: Readonly<{ sellerId: string }>) {
    const { user } = useAuth()
    const router = useRouter()
    const [message, setMessage] = useState("")

    const handleClick = async () => {
        if (!user) return alert("Please log in to message the seller")
        if (!message.trim()) return alert("Message cannot be empty")

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

        router.push(`/messages`)

    }

    return (
        <div>
        <textarea
            className="w-full p-2 border rounded"
            rows={3}
            placeholder="Write a message to the seller..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
        />
        <Button className="w-full mt-4" onClick={handleClick}>
            Message Seller
        </Button>
        </div>
    )
}
