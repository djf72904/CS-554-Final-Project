import Link from "next/link"
import Image from "next/image"
import {GraduationCap, Heart} from "lucide-react"
import { Button } from "@/components/ui/button"
import {capitalizeFirstLetter} from "@/lib/text";
import {Graduate} from "next/dist/compiled/@next/font/dist/google";
import {useAuth} from "@/context/auth-context";

interface ListingCardProps {
  listing: {
    _id: any
    title: string
    price: number
    credits: number
    images: string[]
    school: string
    status: string
    transactionId: string
  }
}

export default function ListingCard({ listing }: ListingCardProps) {
  const {userProfile} = useAuth()

  return (
    <Link href={listing.status === "complete" ? `/confirmation/${listing.transactionId}` : `/items/${listing._id}`} className="group bg-gray-100 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300">
      <div className="relative aspect-square rounded-t-xl overflow-hidden">
        <Image
          src={listing.images?.[0] || "/placeholder.svg?height=600&width=600"}
          alt={listing.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        {listing.school && (
          <div className="absolute top-3 left-3 bg-white px-2 py-1 text-xs font-medium rounded-full flex space-x-1 items-center">
            <GraduationCap color={'#6b7280'} size={16}/>
            <p className="text-sm text-gray-500">{capitalizeFirstLetter(listing.school || "Unknown")}</p>
          </div>
        )}
      </div>
      <div className="mt-2 px-4 pb-4">
        <div className="flex justify-between">
          <h3 className="font-semibold">{listing.title}</h3>
        </div>
        {listing.status === "active" ? (
            <p className="text-sm text-gray-500">Available now</p>
        ) :
        (
            <p className="text-sm text-gray-500">Go to Purchase Confirmation</p>
        )}
        <p className="font-semibold mt-1">
          ${listing.price}{" "}
          {
            userProfile?.school === listing.school ? (
                listing.credits && <span className="text-sm font-normal">or {listing.credits} credits</span>
            ) : null
          }
        </p>
      </div>
    </Link>
  )
}

