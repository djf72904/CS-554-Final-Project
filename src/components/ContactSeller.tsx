"use client"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import {useRouter} from "next/navigation";
import {createMessage} from "@/lib/messages";

export default function ContactSeller({ sellerId }: Readonly<{ sellerId: string }>) {
    const { user } = useAuth()
    const router = useRouter()

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

        await createMessage({
            text: "Hi! I'm interested in your listing.",
            senderId: user.uid,
            receiverId:sellerId,
        })

        router.push(`/messages`)

    }

    return (
        <Button className="w-full mt-4" onClick={handleClick}>
            Contact Seller
        </Button>
    )
}
