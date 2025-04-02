"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PurchaseOptionsProps {
  item: {
    _id: string
    title: string
    price: number
    credits: number
    userId: string
  }
  seller: any
}

export default function PurchaseOptions({ item }: Readonly<PurchaseOptionsProps>) {
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handlePurchase = async (paymentMethod: "cash" | "credit") => {
    if (!user) {
      router.push("/login")
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      alert(`Purchase with ${paymentMethod} initiated! This would connect to a real payment system in production.`)
    } catch (error) {
      console.error("Error making purchase:", error)
      alert("There was an error processing your purchase. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const isOwnListing = user?.uid === item.userId

  return (
    <div className="border rounded-xl p-6 shadow-sm">
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold">${item.price}</div>
        <div className="text-gray-600">or {item.credits} credits</div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <div className="border rounded-md p-3">
          <div className="text-xs text-gray-500">PICKUP DATE</div>
          <div className="font-medium">Flexible</div>
        </div>
        <div className="border rounded-md p-3">
          <div className="text-xs text-gray-500">LOCATION</div>
          <div className="font-medium">Campus Center</div>
        </div>
      </div>

      <div className="mt-6">
        {isOwnListing ? (
          <Button className="w-full" size="lg" variant="outline" disabled>
            This is your listing
          </Button>
        ) : (
          <>
            <Button className="w-full" size="lg" onClick={() => handlePurchase("cash")} disabled={isLoading}>
              Purchase with cash
            </Button>
            <Button
              className="w-full mt-2"
              variant="outline"
              size="lg"
              onClick={() => handlePurchase("credit")}
              disabled={isLoading || (userProfile?.credits || 0) < item.credits}
            >
              Purchase with credits
              {(userProfile?.credits || 0) < item.credits && " (insufficient credits)"}
            </Button>
          </>
        )}
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">You won't be charged until the seller accepts</div>

      <div className="mt-6 border-t pt-6">
        <div className="flex justify-between mb-2">
          <div>Item price</div>
          <div>${item.price}</div>
        </div>
        <div className="flex justify-between mb-2">
          <div>Service fee</div>
          <div>$5</div>
        </div>
        <div className="flex justify-between font-semibold mt-4 pt-4 border-t">
          <div>Total</div>
          <div>${Number(item.price) + 5}</div>
        </div>
      </div>
    </div>
  )
}

