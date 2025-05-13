'use client'
import CategoryFilters from "@/components/category-filters";
import ListingCard from "@/components/listing-card";
import {useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import {getListingsBySchool} from "@/lib/server-actions";
import {Dialog, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";

export const HomeItemListings = ({base_listings, new_user}: {base_listings: any, new_user: boolean}) => {
    const [listings, setListings] = useState<any>(base_listings)
    const [welcomeDialog, setWelcomeDialog] = useState<boolean>(new_user)


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
        return await getListingsBySchool(searchParams.get('school') ?? '')
    }




    useEffect(() => {
        if (searchParams.get('school')) {
            getListingsBySchoolFn().then(res => {
                setListings(res)
            })
        }
    }, [searchParams]);

    useEffect(() => {
        setWelcomeDialog(new_user)
    }, [new_user]);

    const clearSelection = () => setListings(base_listings)



    return  <div className="min-h-screen">
        <Dialog open={welcomeDialog} onOpenChange={setWelcomeDialog}>
            <DialogContent>
                <DialogTitle>
                    Welcome
                </DialogTitle>
                <DialogDescription>
                    Welcome to Campus Bazaar. As a reward for joining here is 1000 credits as well as $1000 to start spending on our marketplace. Enjoy!
                </DialogDescription>
            </DialogContent>
        </Dialog>
        <div className="container mx-auto px-4 py-4">
            <CategoryFilters setListings={clearSelection}/>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {(listings ?? base_listings).filter((listing: any)=>{
                    if(!searchParams.get('category') || searchParams.get('category') === 'all') {
                        return listing
                    }
                    return listing.category.toLowerCase() === searchParams.get('category')
                }).filter(searchFilter()).map((item: any) => (
                    <ListingCard key={item._id} listing={item} />
                ))}
            </div>
        </div>
    </div>
}