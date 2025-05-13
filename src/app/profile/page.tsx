import ProtectedRoute from "@/components/protected-route"
import ProfilePage from "@/components/profile"

export default function UserProfilePage() {
    return (
        <ProtectedRoute>
            <ProfilePage />
        </ProtectedRoute>
    )
}

