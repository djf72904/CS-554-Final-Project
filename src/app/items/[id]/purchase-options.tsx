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

export default function PurchaseOptions({ item }: PurchaseOptionsProps) {
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
      // Here you would implement the purchase logic
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirect to a success page or show a success message
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
        <div className="mt-6 border-t pt-6">
          <div className="flex justify-between mb-2">
            <div>Item price</div>
            <div>${item.price}</div>
          </div>
          <div className="flex justify-between font-semibold mt-4 pt-4 border-t">
            <div>Total</div>
            <div>${Number(item.price) + 5}</div>
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

