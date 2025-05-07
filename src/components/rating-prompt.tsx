"use client"

import { useState, useEffect } from "react"
import { SellerRatingDialog } from "@/components/seller-rating-dialog"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

interface RatingPromptProps {
    sellerId: string
    sellerName: string
    transactionId: string
}

export default function RatingPrompt({ sellerId, sellerName, transactionId }: Readonly<RatingPromptProps>) {
    const [showPrompt, setShowPrompt] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowPrompt(true)
        }, 2000)

        return () => clearTimeout(timer)
    }, [])

    const handleRatingSubmitted = () => {
        setShowPrompt(false)
    }

    if (!showPrompt) return null

    return (
        <div className="p-4 bg-muted rounded-lg border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="font-medium">How was your experience?</h3>
                    <p className="text-sm text-muted-foreground">Rate your transaction with {sellerName} to help other buyers.</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="whitespace-nowrap">
                    <Star className="h-4 w-4 mr-2" />
                    Rate Now
                </Button>
            </div>


        </div>
    )
}
