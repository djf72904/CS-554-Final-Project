import { getListings } from "@/lib/server-actions"
import CategoryFilters from "@/components/category-filters"
import ListingCard from "@/components/listing-card"
import {HomeItemListings} from "@/app/_components/Listings";

export default async function Home({searchParams}: {searchParams: any}) {
  const listings = await getListings()

  const sp = (await searchParams).newUser ?? false

  return (
    <HomeItemListings base_listings={listings} new_user={sp}/>
  )
}

