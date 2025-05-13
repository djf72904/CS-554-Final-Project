import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Share2, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getListingById, getUserById } from "@/lib/server-actions"
import PurchaseOptions from "../_components/purchase-options"
import {capitalizeFirstLetter} from "@/lib/text";
import {ListingItem} from "@/app/items/_components/ListingItem";
import {UserRating} from "@/app/items/_components/Rating";
import {getCurrentUser} from "@/lib/auth"
import {ListItem} from "@/app/items/[id]/_components/ListItem";
import {getPaymentMethods} from "@/lib/payment-methods";

export default async function ItemPage({ params }: { params: { id: string } }) {
  const item = await getListingById((await params).id)


  if (!item) {
    notFound()
  }

  const seller = await getUserById(item.userId)
  if(!seller){
    return notFound()
  }
  const user = await getCurrentUser()

  const payment_methods = JSON.parse(await getPaymentMethods(user?.id!)) ?? []
  let isLiked = false ;
  if(user){
    const userInfo = await getUserById(user.id)
    if(item?.likes?.includes(userInfo.uid)){
      isLiked = true
    }
  }



  return <ListItem item={item} isLiked={isLiked} seller={seller} payment_methods={payment_methods}/>
}

