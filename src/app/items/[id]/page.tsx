import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Share2, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getListingById, getUserById } from "@/lib/server-actions"
import PurchaseOptions from "./purchase-options"
import {capitalizeFirstLetter} from "@/lib/text";

export default async function ItemPage({ params }: { params: { id: string } }) {
  const item = await getListingById((await params).id)

  if (!item) {
    notFound()
  }

  const seller = await getUserById(item.userId)

  return (
      <div className="min-h-screen">
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{item.title}</h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>Save</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="md:col-span-2 aspect-video relative rounded-lg overflow-hidden">
                  <Image src={item.images?.[0] || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                </div>
                {item.images?.slice(1, 5).map((image: string, index: number) => (
                    <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                      <Image
                          src={image || "/placeholder.svg?height=300&width=300"}
                          alt={`${item.title} detail ${index + 1}`}
                          fill
                          className="object-cover"
                      />
                      {index === 3 && item.images.length > 5 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Button variant="outline" className="text-white border-white hover:text-white hover:bg-black/70">
                              Show all photos
                            </Button>
                          </div>
                      )}
                    </div>
                ))}
                {Array.from({ length: item.images?.slice(1).length }).map((_, index) => (
                    <div key={`placeholder-${index}`} className="aspect-square relative rounded-lg overflow-hidden">
                      <Image
                          src={`/placeholder.svg?height=300&width=300`}
                          alt={`${item.title} placeholder ${index + 1}`}
                          fill
                          className="object-cover"
                      />
                    </div>
                ))}
              </div>
            </div>

            <div className="md:sticky md:top-24 h-fit">
              <PurchaseOptions item={item} seller={seller} />
              <div className="mt-8">
                <div className="flex items-start justify-between border-b pb-6">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {item.title} at {capitalizeFirstLetter(item.school)}
                    </h2>
                    <p className="text-gray-500">
                      Condition: {item.condition} • Posted {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 border-2 border-white">
                      <AvatarFallback>{seller?.displayName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <div className="py-6 border-b">
                  <h3 className="text-lg font-semibold mb-4">About this item</h3>
                  <p className="text-gray-700">{item.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">Condition</h4>
                      <p className="text-gray-600">{item.condition}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Category</h4>
                      <p className="text-gray-600">{item.category}</p>
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

                <div className="py-6">
                  <h3 className="text-lg font-semibold mb-4">Seller information</h3>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback>{seller?.displayName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{seller?.displayName || "User"}</h4>
                      <p className="text-gray-600">{capitalizeFirstLetter(seller?.school) || "Unknown"}</p>
                      <div className="flex items-center mt-1">
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
                        <span className="ml-1 font-medium">5.0</span>
                        <span className="ml-1 text-gray-600">(New Seller)</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-4">Contact Seller</Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
  )
}

