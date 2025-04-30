import { getListings } from "@/lib/server-actions"
import CategoryFilters from "@/components/category-filters"
import ListingCard from "@/components/listing-card"
import {HomeItemListings} from "@/app/_components/Listings";

export default async function Home() {
  const listings = await getListings()


  return (
    <HomeItemListings base_listings={listings}/>
  )
}

