import { getListings } from "@/lib/server-actions"
import {HomeItemListings} from "@/app/_components/Listings";

export default async function Home({searchParams}: Readonly<{ searchParams: any }>) {
  const listings = await getListings()

  const sp = (await searchParams).newUser ?? false

  return (
    <HomeItemListings base_listings={listings} new_user={sp}/>
  )
}

