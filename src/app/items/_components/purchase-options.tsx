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
import {createPaymentMethod} from "@/lib/payment-methods";
import {toast, useToast} from "@/hooks/use-toast";
import {MongoPaymentMethodsType} from "@/models/PaymentMethods";
import {cn} from "@/lib/utils";

interface PurchaseOptionsProps {
  item: {
    _id: string
    title: string
    price: number
    credits: number
    userId: string
    pickup_date: string
    pickup_location: string
  }
  seller: any
    pm: MongoPaymentMethodsType[]
}

export default function PurchaseOptions({ item, pm }: Readonly<PurchaseOptionsProps>) {
    const router = useRouter()
    const { user, userProfile } = useAuth()
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

  const handlePurchase = async (paymentMethod: "cash" | "credit") => {
    if (!user) {
      router.push("/login")
      return
    }

    setIsLoading(true)

    try {
        setIsDialogOpen(true)
    } catch (error) {
      alert("There was an error processing your purchase. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

    const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCardForm((prev) => ({ ...prev, [name]: value }))
    }

    const isVisaCard = () => {
        const cardNumber = cardForm.cardNumber.replace(/\s+/g, "")
        return cardNumber.startsWith("4") && cardNumber.length === 16
    }

    const isMasterCard = () => {
        const cardNumber = cardForm.cardNumber.replace(/\s+/g, "")
        return cardNumber.startsWith("5") && cardNumber.length === 16
    }

    const isAmexCard = () => {
        const cardNumber = cardForm.cardNumber.replace(/\s+/g, "")
        return cardNumber.startsWith("3") && (cardNumber.length === 15 || cardNumber.length === 16)
    }

    const validateCardInfo = () => {
        const cardNumber = cardForm.cardNumber.replace(/\s+/g, "")
        const expiryDate = cardForm.expiryDate.split("/").map(Number)
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth() + 1
        const currentYear = currentDate.getFullYear() % 100

        if (cardNumber.length < 16 || !/^\d+$/.test(cardNumber)) {
            return false
        }

        if (expiryDate[0] < currentMonth || (expiryDate[0] === currentMonth && expiryDate[1] < currentYear)) {
            return false
        }

        if (cardForm.cvv.length < 3 || !/^\d+$/.test(cardForm.cvv)) {
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
                        },
                        body: JSON.stringify({
                            data: {
                            cardNumber: cardForm.cardNumber,
                            expirationDate: cardForm.expiryDate,
                            billingName: cardForm.cardName,
                            cvv: cardForm.cvv,
                            userId: user?.uid!,
                            createdAt: new Date()
                        }}),
                    }
                )
            }
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
        {/* Dialog for purchase completion */}
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
                                  disabled={(userProfile?.credits || 0) < item.credits}
                              >
                                  <Wallet className="h-4 w-4" />
                                  <span>Campus Credits</span>
                              </TabsTrigger>
                          </TabsList>

                          <TabsContent value="card" className="mt-4 flex flex-col gap-2  ">
                                  {
                                      pm.map(paymentMethods=>{
                                            return (
                                                <div  key={paymentMethods.id} className={'flex space-x-2 w-full items-center'}>
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
                                                                    •••• {paymentMethods.cardNumber.slice(paymentMethods.cardNumber.length - 5, paymentMethods.cardNumber.length - 1)}
                                                                </Label>
                                                                <div className="text-sm text-muted-foreground">Expires {paymentMethods.expirationDate}</div>
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
                              || (paymentMethod === "card" && !validateCardInfo())
                          }
                      >
                          {isProcessing
                              ? "Processing..."
                              : `Pay ${paymentMethod === "card" ? "$" + item.price : item.credits + " credits"}`}
                      </Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">${item.price}</div>
          <div className="text-gray-600">or {item.credits} credits</div>
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
                <Button className="w-full" size="lg" onClick={() => handlePurchase("cash")} disabled={isLoading}>
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

