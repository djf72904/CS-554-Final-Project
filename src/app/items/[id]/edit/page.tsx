import ProtectedRoute from "@/components/protected-route"
import EditListItemForm from "@/components/edit-list-item-form";
import {getCurrentUser} from "@/lib/auth";

export default async function EditListItemPage({
    params,
                                         }: {
    params: { id: string }
}) {


    //TODO: get listing id from params
    const data = null


    return (
        <ProtectedRoute>
            <EditListItemForm data={data}/>
        </ProtectedRoute>
    )
}

