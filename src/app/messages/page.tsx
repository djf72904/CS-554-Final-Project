import ProtectedRoute from "@/components/protected-route"
import MessagingPage from "@/components/messaging-page"

export default function MessagePage() {
  return (
    <ProtectedRoute>
      <MessagingPage />
    </ProtectedRoute>
  )
}

