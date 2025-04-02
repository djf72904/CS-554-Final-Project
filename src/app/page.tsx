import { getListings } from "@/lib/server-actions"
import CategoryFilters from "@/components/category-filters"
import ListingCard from "@/components/listing-card"

export default async function Home() {
  const listings = await getListings(12)

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4">
        <CategoryFilters />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((item: any) => (
            <ListingCard key={item._id} listing={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

