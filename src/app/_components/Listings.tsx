'use client'
import CategoryFilters from "@/components/category-filters";
import ListingCard from "@/components/listing-card";
import {useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import {getListingsBySchool} from "@/lib/server-actions";

export const HomeItemListings = ({base_listings}: {base_listings: any}) => {


    const [listings, setListings] = useState<any>(base_listings)


    const searchParams = useSearchParams()

    function searchFilter() {
        const lowerQuery = searchParams.get('search')?.trim().toLowerCase();

        return (listing: any) => {
            if (!lowerQuery) return true; // Show all if query is empty

            return ["title", 'school'].some((field) =>
                listing[field]?.toLowerCase().includes(lowerQuery)
            );
        };
    }

    const getListingsBySchoolFn = async () => {
        await getListingsBySchool(searchParams.get('school') ?? '')
    }


    useEffect(() => {
        getListingsBySchoolFn().then(res=>{
            setListings(res)
        })
    }, [searchParams]);




    return  <div className="min-h-screen">
        <div className="container mx-auto px-4 py-4">
            <CategoryFilters schools={Array.from(new Set(base_listings.map((listing: any)=>{
                return listing.school
            })))} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {(listings ?? base_listings).filter((listing: any)=>{
                    if(!searchParams.get('category') || searchParams.get('category') === 'all') {
                        return listing
                    }
                    return listing.category === searchParams.get('category')
                }).filter(searchFilter()).map((item: any) => (
                    <ListingCard key={item._id} listing={item} />
                ))}
            </div>
        </div>
    </div>
}