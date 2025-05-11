"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {Edit, Star, Package, DollarSign, Coins} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { getListingsByUserId } from "@/lib/server-actions"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {capitalizeFirstLetter} from "@/lib/text";
import {useRouter} from "next/navigation";
import {MongoTransactionType} from "@/models/Transaction";
import ListingCard from "@/components/listing-card";
import {MongoListingType} from "@/models/Listing";
import {TransactionData} from "@/lib/reviews";
import {Separator} from "@/components/ui/separator";
import {MongoUserType} from "@/models/User";

export default function ProfileContent({
    listings,
    transactions,
                                         savedPosts,
    reviews,
                                        userProfile
                                       }: Readonly<{
  listings: any
  transactions: any
  savedPosts: any
  reviews: any
  userProfile: any
}>) {
  const [activeTab, setActiveTab] = useState("listings")
  const {user} = useAuth()

  const router = useRouter()


  return (
    <div className="flex flex-col md:flex-row gap-8">
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback>{userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : "U"}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{userProfile?.displayName}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">School</p>
              <p>{capitalizeFirstLetter(userProfile?.school ?? "Not specified")}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Member Since</p>
              <p>{new Date(userProfile?.createdAt!).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={()=>{
            router.push('/profile/edit')
          }}>
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        </CardFooter>
      </Card>

      <div className="flex-[2]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items Listed</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listings.length}</div>
              <p className="text-xs text-muted-foreground">Active listings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Balance</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProfile?.credits || 0}</div>
              <p className="text-xs text-muted-foreground">Available to spend</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Real Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProfile?.balance || 0}</div>
              <p className="text-xs text-muted-foreground">Available to spend</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="purchases">My Purchases</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
          <TabsContent value="listings" className="mt-6">

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {listings.map((item: any) => (
                  <Card key={item._id} className="group bg-gray-100 rounded-xl shadow-sm ">
                    <CardHeader className="p-0">
                      <div className="aspect-square relative">
                        <Image
                          src={item.images?.[0] || "https://www.signfix.com.au/wp-content/uploads/2017/09/placeholder-600x400.png"}
                          alt={item.title}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                        <div
                          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                            item.status === "active" ? "bg-emerald-400 text-white" : "bg-gray-500 text-white"
                          }`}
                        >
                          {item.status === "active" ? "Active" : "Sold"}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <h3 className="font-semibold truncate">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        ${item.price} or {item.credits} credits
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Link href={
                        item.status === "active"
                            ? `/items/${item._id}/edit`
                            : `/items/${item._id}`
                      } className="w-full">
                        <Button variant="outline" className="w-full">
                          {item.status === "active" ? "Edit Listing" : "View Details"}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
          </TabsContent>
          <TabsContent value="purchases">
            <div className="text-center text-muted-foreground py-8">
              {
                transactions?.length ?
                    <div>{ transactions.filter((tx: MongoTransactionType)=>{
                      return tx.buyerId === user?.uid
                    }).map((tx: MongoTransactionType, i: number)=>(
                        <div key={`transactions:${i}`}>
                          <ListingCard listing={{
                            _id: (tx.listingId as MongoListingType)._id as string,
                            credits: (tx.listingId as MongoListingType).credits,
                            images: (tx.listingId as MongoListingType).images,
                            school: (tx.listingId as MongoListingType).school,
                            price: (tx.listingId as MongoListingType).price,
                            title: (tx.listingId as MongoListingType).title,
                            status: (tx.listingId as MongoListingType).status,
                            transactionId: tx._id as string
                          }}/>
                        </div>
                    ))}
                    </div> : <div className="text-center text-muted-foreground py-8">
                      <p className="mb-4">You haven't made any purchases yet.</p>
                      <Link href="/">
                        <Button>Browse Items</Button>
                      </Link>
                    </div>
              }
            </div>
          </TabsContent>
          <TabsContent value="reviews">
            <div className="text-left text-muted-foreground">
              <p>Reviews from buyers</p>
              {
                reviews?.length ?
                    <div className={'flex flex-col space-y-4 mt-4'}>{ reviews.map((tx: any, i: number)=>(
                        <div key={`ratings:${i}`} >
                          <div className={'flex items-center space-x-2'}>
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{tx.buyer.displayName ? tx.buyer.displayName.charAt(0).toUpperCase() : "U"}</AvatarFallback>
                            </Avatar>
                            <p>{tx.buyer?.displayName}</p>
                            <div className="flex items-center">
                              {
                                Array.from({length: tx.rating ?? 0}).map((_, i) => (
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
                              <span className="ml-1 text-sm font-medium">{tx.rating ?? 0} stars</span>
                              <span className="ml-1 text-xs text-gray-500"></span>
                            </div>
                          </div>
                          <p className={'text-left mt-1'}>{
                            tx.review
                          }</p>

                          <Separator/>

                        </div>
                    ))}
                    </div> :  <div className="text-center text-muted-foreground py-8">
                      <p className="mb-4">You haven't made any purchases yet.</p>
                      <Link href="/">
                        <Button>Browse Items</Button>
                      </Link>
                    </div>
              }
            </div>
          </TabsContent>
          <TabsContent value="saved">

              {
                savedPosts?.length ?
                    <div>{ savedPosts.map((saved: MongoListingType, i: number)=>(
                      <div key={`saved_listing:${i}`}>
                        <ListingCard listing={{
                          _id: (saved._id),
                          credits: (saved.credits),
                          images: (saved.images),
                          school: (saved.school),
                          price: (saved.price),
                          title: (saved.title),
                          status: (saved.status),
                          transactionId: ""
                        }}/>
                      </div>
                    ))}
                    </div> :  <div className="text-center text-muted-foreground py-8">
                      <p className="mb-4">You haven't liked any listings yet.</p>
                      <Link href="/">
                        <Button>Browse Items</Button>
                      </Link>
                    </div>
              }
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

