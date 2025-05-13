import { Suspense } from "react"
import ProtectedRoute from "@/components/protected-route"
import ProfileContent from "../app/profile/_components/profile-content"
import {ProfileSkeleton} from "@/app/profile/_components/ProfileSkeleton";
import {getListingsByUserId} from "@/lib/server-actions";
import {getCurrentUser} from "@/lib/auth";
import {notFound} from "next/navigation";
import {getTransactionsByUser, TransactionData} from "@/lib/transactions";
import {convertListingsToObj} from "@/lib/saved-listings";
import {fetchReviewsForUser} from "@/lib/reviews";
import {getSavedListingsFromUser, getUserProfile} from "@/lib/users";

export default async function ProfilePage() {

    const user = await getCurrentUser()

    if(!user){
        return notFound()
    }

    const unsortedListings = await getListingsByUserId(user?.id) ?? [];
    const listings = [...unsortedListings].sort((a, b) => {
        if (a.status === "active" && b.status === "complete") return -1;
        if (a.status === "complete" && b.status === "active") return 1;
        return 0;
    })
    const transactions: TransactionData[] = JSON.parse(await getTransactionsByUser(user?.id)) ?? []
    const rawSaved = JSON.parse(await convertListingsToObj(await getSavedListingsFromUser(user?.id))) ?? [];
    const savedPosts = [...rawSaved].sort((a, b) => {
        if (a.status === "active" && b.status === "complete") return -1;
        if (a.status === "complete" && b.status === "active") return 1;
        return 0;
    })
    const reviews = JSON.parse(await fetchReviewsForUser(user?.id)) ?? []
    const userProfile = (await getUserProfile(user.id)) ?? null


    return (
        <ProtectedRoute>
            <div className="container mx-auto px-4 py-8">
                <Suspense fallback={<ProfileSkeleton />}>
                    <ProfileContent reviews={reviews} listings={listings} transactions={transactions} savedPosts={savedPosts} userProfile={userProfile} />
                </Suspense>
            </div>
        </ProtectedRoute>
    )
}