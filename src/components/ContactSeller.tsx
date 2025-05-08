// components/ContactSeller.tsx
"use client"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"

export default function ContactSeller({ sellerId }: { sellerId: string }) {
    const { user } = useAuth()

    const handleClick = async () => {
        if (!user) return alert("Please log in to message the seller")

        await fetch("/api/messages/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${await user.getIdToken()}`,
            },
            body: JSON.stringify({
                from: user.uid,
                to: sellerId,
                text: "Hi! I'm interested in your listing.",
            }),
        })

        alert("Message sent!")
    }

    return (
        <Button className="w-full mt-4" onClick={handleClick}>
            Contact Seller
        </Button>
    )
}
