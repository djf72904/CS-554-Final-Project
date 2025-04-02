import { searchListings } from "@/lib/server-actions"
import ListingCard from "@/components/listing-card"
import { Button } from "@/components/ui/button"
import SearchForm from "./search-form"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q: string }
}) {
  const query = searchParams.q || ""
  const listings = query ? await searchListings(query) : []

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <SearchForm initialQuery={query} />

        {query ? (
          <>
            <h1 className="text-2xl font-bold mt-8 mb-6">
              {listings.length > 0 ? `Search results for "${query}"` : `No results found for "${query}"`}
            </h1>

            {listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {listings.map((item: any) => (
                  <ListingCard key={item._id} listing={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-6">Try adjusting your search or browse all items.</p>
                <Button asChild>
                  <a href="/">Browse All Items</a>
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Search for items</h2>
            <p className="text-muted-foreground">Enter a search term above to find items.</p>
          </div>
        )}
      </div>
    </div>
  )
}

