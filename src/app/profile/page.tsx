import { Suspense } from "react"
import ProtectedRoute from "@/components/protected-route"
import ProfileContent from "./_components/profile-content"
import {ProfileSkeleton} from "@/app/profile/_components/ProfileSkeleton";
import {getListingById, getListingsByUserId} from "@/lib/server-actions";
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

    const listings = await getListingsByUserId(user?.id) ?? []
    const transactions: TransactionData[] = JSON.parse(await getTransactionsByUser(user?.id)) ?? []
    const savedPosts = JSON.parse(await convertListingsToObj(await getSavedListingsFromUser(user?.id))) ?? null
    const reviews = JSON.parse(await fetchReviewsForUser(user?.id)) ?? []
    const userProfile = JSON.parse(await getUserProfile(user.id)) ?? null

    console.log(savedPosts)

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




