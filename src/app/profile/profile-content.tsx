"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Edit, Star, Package, DollarSign } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { getListingsByUserId } from "@/lib/server-actions"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {capitalizeFirstLetter} from "@/lib/text";

export default function ProfileContent() {
  const [activeTab, setActiveTab] = useState("listings")
  const { user, userProfile } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchListings() {
      if (user) {
        try {
          const userListings = await getListingsByUserId(user.uid)
          setListings(userListings)
        } catch (error) {
          console.error("Error fetching listings:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchListings()
  }, [user])

  if (!user || !userProfile) {
    return <div>Loading profile...</div>
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback>{user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{user.displayName}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">School</p>
              <p>{capitalizeFirstLetter(userProfile.school ?? "Not specified")}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Member Since</p>
              <p>{new Date(userProfile.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        </CardFooter>
      </Card>

      <div className="flex-[2]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

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
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProfile.credits || 0}</div>
              <p className="text-xs text-muted-foreground">Available to spend</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="purchases">My Purchases</TabsTrigger>
          </TabsList>
          <TabsContent value="listings" className="mt-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {listings.map((item: any) => (
                  <Card key={item._id}>
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
                            item.status === "active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"
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
                      <Link href={`/items/${item._id}`} className="w-full">
                        <Button variant="outline" className="w-full">
                          {item.status === "active" ? "Edit Listing" : "View Details"}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't listed any items yet.</p>
                <Link href="/list-item">
                  <Button>List Your First Item</Button>
                </Link>
              </div>
            )}
          </TabsContent>
          <TabsContent value="purchases">
            <div className="text-center text-muted-foreground py-8">
              <p className="mb-4">You haven't made any purchases yet.</p>
              <Link href="/">
                <Button>Browse Items</Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

