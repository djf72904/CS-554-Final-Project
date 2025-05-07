import { getListingsByCategory } from "@/lib/server-actions"
import CategoryFilters from "@/components/category-filters"
import ListingCard from "@/components/listing-card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default async function CategoryPage({ params }: Readonly<{ params: { category: string } }>) {
  const listings = await getListingsByCategory(params.category)

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4">
        {/*<CategoryFilters />*/}

        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="sm" className="rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 mr-2"
            >
              <path d="M3 6h18" />
              <path d="M7 12h10" />
              <path d="M10 18h4" />
            </svg>
            Filters
          </Button>
          <div className="flex items-center gap-2">
            <Switch id="credit-only" />
            <Label htmlFor="credit-only" className="text-sm">
              Display total before fees
            </Label>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6 capitalize">{params.category} Items</h1>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((item: any) => (
              <ListingCard key={item._id} listing={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No listings found</h2>
            <p className="text-muted-foreground mb-6">There are currently no items in this category.</p>
            <Button asChild>
              <a href="/list-item">List an Item</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

