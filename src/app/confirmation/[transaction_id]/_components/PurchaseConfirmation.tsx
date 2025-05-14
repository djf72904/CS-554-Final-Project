"use client"

import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { CheckCircle, ArrowRight, MessageSquare, Calendar, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {capitalizeFirstLetter} from "@/lib/text";
import RatingPrompt from "@/components/rating-prompt";
import {SellerRatingDialog} from "@/components/seller-rating-dialog";
import {useEffect, useState} from "react";
import {useAuth} from "@/context/auth-context";

export default function PurchaseConfirmation({transaction, seller}: Readonly<{ transaction: any, seller: any }>) {

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [rating, setRating] = useState<number>(seller.rating)

    const {user} = useAuth()
    const router = useRouter()

    useEffect(()=>{
        setTimeout(()=>{
            setIsDialogOpen(true)
        }, 2000)
    }, [])

    const handleClick = async () => {
        if (!user) return alert("Please log in to message the seller")
        console.log({
            user, seller
        })

        await fetch("/api/messages/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${await user.getIdToken()}`,
            },
            body: JSON.stringify({
                from: user.uid,
                to: seller.uid,
                text: `Hello! I just purchased your ${transaction.listingId.title}. Would you like to schedule a time and place to meet up?`
            }),
        }).then(async r=>{
            if((await r.json()).success){
                router.push(`/messages`)
            }
        })
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-16">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold">Purchase Confirmed!</h1>
                <p className="text-gray-500 mt-2">
                    Your purchase has been successfully processed. The seller has been notified.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className=" space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Purchase Summary</CardTitle>
                            <CardDescription>Transaction ID: {transaction._id}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
                                    <Image
                                        src={transaction.listingId?.images?.[0] || "/placeholder.svg"}
                                        alt={transaction.listingId?.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-medium">{transaction.listingId.title}</h3>
                                    <p className="text-sm text-gray-500">Condition: {transaction.listingId.condition}</p>
                                    <p className="text-sm text-gray-500">Category: {transaction.listingId.category}</p>
                                    <p className="text-sm font-medium mt-2">
                                        {transaction.paymentMethod === "credit"
                                            ? `${transaction.listingId.credits} credits`
                                            : `$${transaction.listingId.price}`}
                                    </p>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Item price</span>
                                    <span>
                    {transaction.paymentMethod === "credit"
                        ? `${transaction.listingId.credits} credits`
                        : `$${transaction.listingId.price}`}
                  </span>
                                </div>
                                <Separator className="my-2" />

                                <div className="flex justify-between font-medium">
                                    <span>Total</span>
                                    <span>
                    {transaction.paymentMethod === "credit"
                        ? `${transaction.credits} credits`
                        : `$${Number(transaction.listingId.price)}`}
                  </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Method</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    {transaction.paymentMethod === "credit" ? (
                                        <>
                                            <div className="bg-primary/10 rounded-full p-2">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="h-5 w-5 text-primary"
                                                >
                                                    <circle cx="12" cy="12" r="10" />
                                                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                                                    <path d="M12 18V6" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium">Campus Credits</p>
                                                <p className="text-sm text-gray-500">
                                                    {transaction.credits} credits have been deducted from your account
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="bg-primary/10 rounded-full p-2">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="h-5 w-5 text-primary"
                                                >
                                                    <rect width="20" height="14" x="2" y="5" rx="2" />
                                                    <line x1="2" x2="22" y1="10" y2="10" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium">Cash on Pickup</p>
                                                <p className="text-sm text-gray-500">Please bring exact change for a smooth transaction</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>


                        <div className="text-center">
                            <Button variant="outline" asChild>
                                Return to Marketplace
                            </Button>
                        </div>
                    </div>

                </div>
                <div className={'flex flex-col space-y-6'}>
                    {transaction.rating === 0 ?
                        (<SellerRatingDialog
                        sellerId={seller._id}
                        sellerName={seller.displayName}
                        transactionId={transaction._id}
                        isOpen={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        onRatingSubmitted={setRating}
                    />): null
                    }
                    <Card>
                        <CardHeader>
                            <CardTitle>Seller Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center text-center">
                                <div className="relative h-20 w-20 rounded-full overflow-hidden mb-4">
                                    <Avatar className="h-20 w-20">
                                        <AvatarFallback>{seller.displayName ? seller.displayName.charAt(0).toUpperCase() : "U"}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <h3 className="font-medium">{seller?.displayName || "Seller"}</h3>
                                <p className="text-sm text-gray-500">{capitalizeFirstLetter(seller.school)}</p>
                                <div className="flex items-center mt-2">
                                    {
                                        Array.from({length: seller.rating}).map((_, i) => (
                                            <svg
                                                key={`rating:${i}`}
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="h-4 w-4 text-yellow-500"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        ))


                                    }

                                    <span className="ml-1 text-sm font-medium">{rating} stars</span>
                                    <span className="ml-1 text-xs text-gray-500"></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Next Steps</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <div className="bg-primary/10 rounded-full p-2 h-fit">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Contact the Seller</h3>
                                    <p className="text-sm text-gray-500">
                                        Message {seller?.displayName || "the seller"} to arrange a meeting time and place for pickup.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="bg-primary/10 rounded-full p-2 h-fit">
                                    <Calendar className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Schedule Pickup</h3>
                                    <p className="text-sm text-gray-500">Agree on a convenient time to meet and exchange the item.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="bg-primary/10 rounded-full p-2 h-fit">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Meet at a Safe Location</h3>
                                    <p className="text-sm text-gray-500">
                                        We recommend meeting at the Campus Center or another public place on campus.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full" onClick={handleClick}>
                                <p>Message Seller <ArrowRight className="ml-2 h-4 w-4" /></p>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>


            </div>
        </div>
    )
}
