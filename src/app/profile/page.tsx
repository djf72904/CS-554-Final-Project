import { Suspense } from "react"
import ProtectedRoute from "@/components/protected-route"
import ProfileContent from "./profile-content"
import {ProfileSkeleton} from "@/app/profile/_components/ProfileSkeleton";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileContent />
        </Suspense>
      </div>
    </ProtectedRoute>
  )
}




