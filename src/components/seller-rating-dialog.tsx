"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface SellerRatingDialogProps {
    sellerId: string
    sellerName: string
    transactionId: string
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onRatingSubmitted?: () => void
}

export function SellerRatingDialog({
                                       sellerId,
                                       sellerName,
                                       transactionId,
                                       isOpen,
                                       onOpenChange,
                                       onRatingSubmitted,
                                   }: SellerRatingDialogProps) {
    const router = useRouter()
    const { user } = useAuth()
    const { toast } = useToast()
    const [rating, setRating] = useState<number>(0)
    const [hoveredRating, setHoveredRating] = useState<number>(0)
    const [review, setReview] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!user) {
            toast({
                title: "Error",
                description: "You must be logged in to submit a review",
                variant: "destructive",
            })
            return
        }

        if (rating === 0) {
            toast({
                title: "Error",
                description: "Please select a star rating",
                variant: "destructive",
            })
            return
        }

        setIsSubmitting(true)

        try {
            // In a real app, you would call an API endpoint to submit the review
            // For example:
            // await fetch('/api/reviews', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({
            //     sellerId,
            //     buyerId: user.uid,
            //     transactionId,
            //     rating,
            //     review,
            //     createdAt: new Date()
            //   })
            // })


            toast({
                title: "Review submitted",
                description: "Thank you for your feedback!",
            })

            // Reset form
            setRating(0)
            setReview("")

            // Close dialog
            onOpenChange(false)

            // Call the callback if provided
            if (onRatingSubmitted) {
                onRatingSubmitted()
            }

            // Optionally refresh the page or navigate
            // router.refresh()
        } catch (error) {
            console.error("Error submitting review:", error)
            toast({
                title: "Error",
                description: "Failed to submit your review. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Rate Your Experience</DialogTitle>
                    <DialogDescription>
                        How was your experience with {sellerName}? Your feedback helps other buyers.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="flex items-center justify-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="p-1 focus:outline-none"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                >
                                    <Star
                                        className={`h-8 w-8 ${
                                            star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                        } transition-colors`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-center text-muted-foreground">
                            {rating === 1 && "Poor"}
                            {rating === 2 && "Fair"}
                            {rating === 3 && "Good"}
                            {rating === 4 && "Very Good"}
                            {rating === 5 && "Excellent"}
                            {rating === 0 && "Select a rating"}
                        </p>
                    </div>

                    <div className="mt-6 space-y-2">
                        <label htmlFor="review" className="text-sm font-medium">
                            Write a review (optional)
                        </label>
                        <Textarea
                            id="review"
                            placeholder="Share details of your experience with this seller..."
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            rows={4}
                        />
                        <p className="text-xs text-muted-foreground">
                            Your review will be public and associated with your profile.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0 || !review}>
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
