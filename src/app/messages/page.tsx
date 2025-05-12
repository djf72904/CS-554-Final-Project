import ProtectedRoute from "@/components/protected-route"
import MessagingPage from "@/components/messaging-page"

export default function ListItemPage() {
  return (
    <ProtectedRoute>
      <MessagingPage />
    </ProtectedRoute>
  )
}

