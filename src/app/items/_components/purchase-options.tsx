"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { format } from "date-fns"
import {Separator} from "@radix-ui/react-menu";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {CreditCard, Wallet, X} from "lucide-react"
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {toast} from "@/hooks/use-toast";
import {MongoPaymentMethodsType} from "@/models/PaymentMethods";
import {cn} from "@/lib/utils";
import {capitalizeFirstLetter} from "@/lib/text";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {UserRating} from "@/app/items/_components/Rating";
import ContactSeller from "@/components/contact-seller";
import {DialogBody} from "next/dist/client/components/react-dev-overlay/ui/components/dialog";

interface PurchaseOptionsProps {
  item: {
      _id: string
      description: string
      title: string
      price: number
      credits: number
      userId: string
      pickup_date: string
      pickup_location: string
      condition: string
      category: string
      createdAt: string
      school: string
  }
  seller: any
    pm: MongoPaymentMethodsType[]
}

export default function PurchaseOptions({ item, pm, seller }: Readonly<PurchaseOptionsProps>) {
    const router = useRouter()
    const { user, userProfile, school } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<"card" | "credit">("card")
    const [cardForm, setCardForm] = useState({
        cardNumber: "",
        cardName: "",
        expiryDate: "",
        cvv: "",
    })
    const [saveCardInfo, setSaveCardInfo] = useState(false)
    const [userPaymentMethod, setUserPaymentMethod] = useState<MongoPaymentMethodsType | null>(null)



    const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { name, value } = e.target

        if (name === "cardNumber") {
            // Remove all non-digit characters
            value = value.replace(/\D/g, "")
            // Add space every 4 digits
            value = value.replace(/(.{4})/g, "$1 ").trim()
        }

        if (name === "expiryDate") {
            // Remove all non-digit characters
            value = value.replace(/\D/g, "")
            // Insert "/" after 2 digits
            if (value.length >= 3) {
                value = `${value.slice(0, 2)}/${value.slice(2, 4)}`
            }
        }

        setCardForm((prev) => ({ ...prev, [name]: value }))
    }

    const isAmexCard = () => {
        const cardNumber = cardForm.cardNumber.replace(/\s+/g, "")
        return cardNumber.startsWith("3") && (cardNumber.length === 15 || cardNumber.length === 16)
    }

    const validateCardInfo = () => {
        const cardNumber = cardForm.cardNumber.replace(/\s+/g, "")
        const [expMonth, expYear] = cardForm.expiryDate.split("/").map(Number)
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth() + 1
        const currentYear = currentDate.getFullYear() % 100

        if (cardNumber.length < 15 || !/^\d+$/.test(cardNumber)) {
            return false
        }

        if (
            isNaN(expMonth) || isNaN(expYear) ||
            expMonth < 1 || expMonth > 12 ||
            expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)
        ) {
            return false
        }

        const isAmex = isAmexCard()
        const expectedCVVLength = isAmex ? 4 : 3

        if (
            cardForm.cvv.length !== expectedCVVLength ||
            !/^\d+$/.test(cardForm.cvv)
        ) {
            return false
        }

        return true
    }

  const isOwnListing = user?.uid === item.userId

    const handleSubmit = async () => {
        setIsProcessing(true)
        setIsDialogOpen(false)

        try {
            if(saveCardInfo){
                await fetch(
                    "/api/payment-methods",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${await user?.getIdToken()}`
                        },
                        body: JSON.stringify({
                            data: {
                            cardNumber: cardForm.cardNumber,
                            expirationDate: cardForm.expiryDate,
                            billingName: cardForm.cardName,
                            cvv: cardForm.cvv,
                            last4: cardForm.cardNumber.slice(-4),
                            userId: user?.uid!,
                            createdAt: new Date()
                        }}),
                    }
                )
            }

            const res = await fetch(
                "/api/purchase",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${await user?.getIdToken()}`
                    },
                    body: JSON.stringify({
                        buyerId: user?.uid,
                        sellerId: seller?.uid,
                        postId: item?._id,
                        balance: item.credits,
                        balanceType: paymentMethod
                    }),
                }
            )

            router.push(`/confirmation/${(await res.json()).transactionId}`)

        } catch (error) {
            toast({
                title: "Error",
                description: "There was an error processing your payment. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const getCardIcon = (cardType: string) => {
        switch (cardType) {
            case "visa":
                return <div className="text-blue-600 font-bold italic text-sm">VISA</div>
            case "mastercard":
                return (
                    <div className="flex">
                        <div className="w-4 h-4 bg-red-500 rounded-full opacity-80 -mr-1.5"></div>
                        <div className="w-4 h-4 bg-yellow-400 rounded-full opacity-80"></div>
                    </div>
                )
            case "amex":
                return <div className="text-green-600 font-bold text-xs">AMEX</div>
            case "discover":
                return <div className="text-orange-500 font-bold text-xs">DISCOVER</div>
            default:
                return <CreditCard className="h-4 w-4" />
        }
    }

  return (
      <div className="border rounded-xl p-6 shadow-sm">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                      <DialogTitle>Complete your purchase</DialogTitle>
                      <DialogDescription>Choose your payment method and complete your purchase.</DialogDescription>
                  </DialogHeader>

                  <div className="py-4">
                      <div className="mb-4 p-3 bg-muted rounded-md">
                          <h3 className="font-medium text-sm">Purchase Summary</h3>
                          <p className="text-sm">{item.title}</p>
                          {item.pickup_date && (
                              <p className="text-xs text-muted-foreground">
                                  Pickup: {format(new Date(item.pickup_date), "MMM d, yyyy")}
                              </p>
                          )}
                          {item.pickup_location && <p className="text-xs text-muted-foreground">Location: {item.pickup_location}</p>}
                          <Separator className="my-2" />
                          <div className="flex justify-between text-sm">
                              <span>Total:</span>
                              <span className="font-medium">${item.price}</span>
                          </div>
                      </div>

                      <Tabs
                          defaultValue="card"
                          value={paymentMethod}
                          onValueChange={(value) => setPaymentMethod(value as "card" | "credit")}
                      >
                          <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="card" className="flex items-center gap-2"
                                           disabled={(userProfile?.balance || 0) < item.price}
                              >
                                  <CreditCard className="h-4 w-4" />
                                  <span>Card</span>
                              </TabsTrigger>
                              <TabsTrigger
                                  value="credit"
                                  className="flex items-center gap-2"
                                  //Checks if students are form same school and if not, credits are disabled, only payment method is card
                                  disabled={(userProfile?.credits || 0) < item.credits || seller.email.split("@")[1] !== user?.email?.split("@")[1]}
                              >
                                  <Wallet className="h-4 w-4" />
                                  <span>Campus Credits</span>
                              </TabsTrigger>
                          </TabsList>

                          <TabsContent value="card" className="mt-4 flex flex-col gap-2  ">
                                  {
                                      pm.map(paymentMethods=>{
                                            return (
                                                <div key={paymentMethods.id} className={'flex space-x-2 w-full items-center'}>
                                                <div
                                                    onClick={()=>{
                                                        setUserPaymentMethod(paymentMethods)
                                                    }}

                                                    className={cn(
                                                        `flex items-center justify-between rounded-lg border p-4 hover:bg-gray-200 duration-150 cursor-pointer flex-1 ${
                                                            paymentMethods.cardNumber === userPaymentMethod?.cardNumber && 'border-red-400'
                                                        }`,
                                                    )}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="h-10 w-14 flex items-center justify-center rounded bg-gray-100">
                                                                {getCardIcon(paymentMethods.cardNumber.startsWith("4") ? "visa" : paymentMethods.cardNumber.startsWith("5") ? "mastercard" : paymentMethods.cardNumber.startsWith("3") ? "amex" : "other")}
                                                            </div>
                                                            <div>
                                                                <Label htmlFor={paymentMethods.id} className="text-base font-medium flex items-center">
                                                                    •••• {paymentMethods.last4}
                                                                </Label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                    {  paymentMethods.cardNumber === userPaymentMethod?.cardNumber &&  <button
                                                        className={'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 px-2 py-1 rounded-full'}
                                                        onClick={()=>{
                                                            setUserPaymentMethod(null)
                                                        }}>
                                                        Clear
                                                    </button>}
                                                </div>

                                            )
                                      })
                                  }
                              {
                                  !userPaymentMethod && <>
                                      <div className="space-y-2">
                                          <Label htmlFor="cardNumber">Card Number</Label>
                                          <Input
                                              id="cardNumber"
                                              name="cardNumber"
                                              placeholder="1234 5678 9012 3456"
                                              value={cardForm.cardNumber}
                                              onChange={handleCardInputChange}
                                              maxLength={19}
                                              inputMode="numeric"
                                              pattern="\d{4}\s?\d{4}\s?\d{4}\s?\d{1,4}"
                                              autoComplete="cc-number"
                                          />
                                      </div>

                                      <div className="space-y-2">
                                          <Label htmlFor="cardName">Cardholder Name</Label>
                                          <Input
                                              id="cardName"
                                              name="cardName"
                                              placeholder="John Doe"
                                              value={cardForm.cardName}
                                              onChange={handleCardInputChange}
                                              pattern="^[a-zA-Z\s]+$"
                                              autoComplete="cc-name"
                                          />
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                              <Label htmlFor="expiryDate">Expiry Date</Label>
                                              <Input
                                                  id="expiryDate"
                                                  name="expiryDate"
                                                  placeholder="MM/YY"
                                                  value={cardForm.expiryDate}
                                                  onChange={handleCardInputChange}
                                                  maxLength={5}
                                                  inputMode="numeric"
                                                  pattern="(0[1-9]|1[0-2])\/\d{2}"
                                                  autoComplete="cc-exp"
                                              />
                                          </div>

                                          <div className="space-y-2">
                                              <Label htmlFor="cvv">CVV</Label>
                                              <Input
                                                  id="cvv"
                                                  name="cvv"
                                                  placeholder="123"
                                                  value={cardForm.cvv}
                                                  onChange={handleCardInputChange}
                                                  maxLength={4}
                                                  inputMode="numeric"
                                                  pattern="\d{3,4}"
                                                  autoComplete="cc-csc"
                                                  type="password"
                                              />
                                          </div>
                                      </div>
                                  </>
                              }


                              <p className="text-xs text-muted-foreground">
                                  Your card information is encrypted and secure. We do not store your full card details.
                              </p>
                              {/* Save payment info */}
                              {
                                  !userPaymentMethod &&
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="savePayment" onChange={
                                        (e) => setSaveCardInfo(e.target.checked)
                                    } />
                                    <label htmlFor="savePayment" className="text-xs text-muted-foreground">
                                            Save this payment method for future purchases
                                        </label>

                                </div>
                              }
                              {(userProfile?.balance || 0) < item.price && (
                                  <p className="mt-2 text-sm text-destructive">Insufficient Balance</p>
                              )}
                          </TabsContent>

                          <TabsContent value="credit" className="mt-4">
                              <div className="p-4 border rounded-md">
                                  <div className="flex justify-between items-center mb-4">
                                      <div>
                                          <h3 className="font-medium">Campus Credits</h3>
                                          <p className="text-sm text-muted-foreground">Pay using your campus credit balance</p>
                                      </div>
                                      <div className="text-right">
                                          <p className="font-medium">{userProfile?.credits || 0} credits</p>
                                          <p className="text-xs text-muted-foreground">Your balance</p>
                                      </div>
                                  </div>

                                  <Separator />

                                  <div className="mt-4 flex justify-between items-center">
                                      <span>Cost:</span>
                                      <span className="font-medium">{item.credits} credits</span>
                                  </div>

                                  <div className="mt-2 flex justify-between items-center">
                                      <span>Remaining balance:</span>
                                      <span className="font-medium">{Math.max(0, (userProfile?.credits || 0) - item.credits)} credits</span>
                                  </div>

                                  {(userProfile?.credits || 0) < item.credits && (
                                      <p className="mt-2 text-sm text-destructive">You don't have enough credits for this purchase.</p>
                                  )}
                              </div>
                          </TabsContent>
                      </Tabs>
                  </div>

                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>
                          Cancel
                      </Button>
                      <Button
                          onClick={handleSubmit}
                          disabled={isProcessing || (paymentMethod === "credit" && (userProfile?.credits || 0) < item.credits)
                              || (paymentMethod === "card" && (userProfile?.balance || 0) < item.price)
                              || (paymentMethod === "card" && (userPaymentMethod === null && !validateCardInfo()))
                          }
                      >
                          {isProcessing
                              ? "Processing..."
                              : `Pay ${paymentMethod === "card" ? "$" + item.price : item.credits + " credits"}`}
                      </Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>
          <div className="flex items-start justify-between border-b pb-6">
              <div>
                  <h2 className="text-xl font-semibold">
                      {item.title} at {capitalizeFirstLetter(item.school)}
                  </h2>
                  <p className="text-gray-500">
                      Condition: {item.condition} • Posted {new Date(item.createdAt).toLocaleDateString()}
                  </p>
              </div>
              <Dialog>
                  <DialogTrigger asChild>
                      <Button>Seller Info</Button>
                  </DialogTrigger>
                  <DialogContent>
                      <DialogTitle>Seller Information</DialogTitle>
                      <DialogBody>
                          <div>
                              <div>
                                  <h3 className="text-lg font-semibold mb-4"></h3>
                                  <div className="flex items-center gap-4">
                                      <Avatar className="h-16 w-16">
                                          <AvatarFallback>{seller?.displayName?.charAt(0) || "U"}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                          <h4 className="font-medium">{seller?.displayName || "User"}</h4>
                                          <p className="text-gray-600">{capitalizeFirstLetter(seller?.school!) || "Unknown"}</p>
                                          <div className="flex items-center mt-1">
                                              <UserRating seller={seller}/>
                                          </div>
                                      </div>
                                  </div>
                                  {user === null ? null :
                                      <ContactSeller sellerId={item.userId}/>
                                  }
                              </div>
                          </div>
                      </DialogBody>

                  </DialogContent>
              </Dialog>
          </div>

          <div className="py-6 border-b">
              <h3 className="text-lg font-semibold mb-4">About this item</h3>
              <p className="text-gray-700">{item.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                      <h4 className="font-medium">Condition</h4>
                      <p className="text-gray-600">{capitalizeFirstLetter(item.condition)}</p>
                  </div>
                  <div>
                      <h4 className="font-medium">Category</h4>
                      <p className="text-gray-600">{capitalizeFirstLetter(item.category)}</p>
                  </div>
                  <div>
                      <h4 className="font-medium">School</h4>
                      <p className="text-gray-600">{capitalizeFirstLetter(item.school)}</p>
                  </div>
                  <div>
                      <h4 className="font-medium">Listed</h4>
                      <p className="text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
              </div>
          </div>
        <div className="flex items-baseline justify-between mt-4">
          <div className="text-2xl font-bold">${item.price}</div>
            {school === item.school ?
                (<div className="text-gray-600">or {item.credits} credits</div>)
                : null
            }
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2">
          <div className="border rounded-md p-3">
            <div className="text-xs text-gray-500">PICKUP DATE</div>
            <div className="font-medium">{
              // 1 day from now
                new Date(new Date().setDate(
                    new Date().getDate() + 1
                )).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    })
            }</div>
          </div>
        </div>

        <div className="mt-6">
          {isOwnListing ? (
              <Button className="w-full" size="lg" variant="outline" disabled>
                This is your listing
              </Button>
          ) : (
                <Button className="w-full" size="lg" onClick={() => setIsDialogOpen(true)} disabled={isLoading || user == null}>
                  Purchase
                </Button>
          )}
        </div>
        <div className="mt-6 border-t pt-6">
          <div className="flex justify-between mb-2">
            <div>Item price</div>
            <div>${item.price}</div>
          </div>
          <div className="flex justify-between font-semibold mt-4 pt-4 border-t">
            <div>Total</div>
            <div>${Number(item.price)}</div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center">
          <Badge variant="outline" className="text-xs px-2 py-1 rounded-full">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3 mr-1"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
            Verified .edu transaction
          </Badge>
        </div>
      </div>
  )
}

