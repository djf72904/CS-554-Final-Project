import ProtectedRoute from "@/components/protected-route"
import ListItemForm from "@/components/list-item-form"

export default function ListItemPage() {
  return (
    <ProtectedRoute>
      <ListItemForm />
    </ProtectedRoute>
  )
}

