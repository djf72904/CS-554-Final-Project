import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ListingCardProps {
  listing: {
    _id: string
    title: string
    price: number
    credits: number
    images: string[]
    school: string
  }
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link href={`/items/${listing._id}`} className="group">
      <div className="relative aspect-square rounded-xl overflow-hidden">
        <Image
          src={listing.images?.[0] || "/placeholder.svg?height=600&width=600"}
          alt={listing.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        {listing.school && (
          <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-md text-xs font-medium">
            {listing.school}
          </div>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2">
        <div className="flex justify-between">
          <h3 className="font-semibold">{listing.title}</h3>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clipRule="evenodd"
              />
            </svg>
            <span className="ml-1 text-sm">5.0</span>
          </div>
        </div>
        <p className="text-sm text-gray-500">{listing.school || "Unknown"}</p>
        <p className="text-sm text-gray-500">Available now</p>
        <p className="font-semibold mt-1">
          ${listing.price}{" "}
          {listing.credits && <span className="text-sm font-normal">or {listing.credits} credits</span>}
        </p>
      </div>
    </Link>
  )
}

