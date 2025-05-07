'use client'

import {ArrowRight, Calendar, CheckCircle, MapPin} from "lucide-react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import Image from "next/image";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import Link from "next/link";

export const PurchaseConfirmation = ({transaction}: {transaction: any}) => {
    
    return <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold">Purchase Confirmed!</h1>
            <p className="text-gray-500 mt-2">
                Your purchase has been successfully processed. The seller has been notified.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Purchase Summary</CardTitle>
                        <CardDescription>Transaction ID: {transaction.id}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
                                <Image
                                    src={transaction.listing.images?.[0] || "/placeholder.svg"}
                                    alt={transaction.listing.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="font-medium">{transaction.listing.title}</h3>
                                <p className="text-sm text-gray-500">Condition: {transaction.listing.condition}</p>
                                <p className="text-sm text-gray-500">Category: {transaction.listing.category}</p>
                                <p className="text-sm font-medium mt-2">
                                    {transaction.paymentMethod === "credit"
                                        ? `${transaction.listing.credits} credits`
                                        : `$${transaction.listing.price}`}
                                </p>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Item price</span>
                                <span>
                    {transaction.paymentMethod === "credit"
                        ? `${transaction.listing.credits} credits`
                        : `$${transaction.listing.price}`}
                  </span>
                            </div>

                            {transaction.paymentMethod !== "credit" && (
                                <div className="flex justify-between text-sm">
                                    <span>Service fee</span>
                                    <span>${transaction.fee}</span>
                                </div>
                            )}

                            <Separator className="my-2" />

                            <div className="flex justify-between font-medium">
                                <span>Total</span>
                                <span>
                    {transaction.paymentMethod === "credit"
                        ? `${transaction.total} credits`
                        : `$${Number(transaction.listing.price) + transaction.fee}`}
                  </span>
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
                        <Button asChild className="w-full">
                            <Link href={`/messages/${transaction.listing.userId}`}>
                                Message Seller <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Seller Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center text-center">
                            <div className="relative h-20 w-20 rounded-full overflow-hidden mb-4">
                            {/*  TODO: ADD PROFILE AVATAR PLACEHOLDER THING - JACK  */}
                            </div>
                            <h3 className="font-medium">[SELLER DISPLAY NAME]</h3>
                            <p className="text-sm text-gray-500">[SELLER SCHOOL]</p>
                            <div className="flex items-center mt-2">
                                <svg
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
                                <span className="ml-1 text-sm font-medium">5.0</span>
                                <span className="ml-1 text-xs text-gray-500">(New Seller)</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

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
                                            {transaction.total} credits have been deducted from your account
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
                        <Link href="/">Return to Marketplace</Link>
                    </Button>
                </div>
            </div>
        </div>
    </div>
    
}