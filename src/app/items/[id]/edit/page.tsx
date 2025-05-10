import ProtectedRoute from "@/components/protected-route"
import EditListItemForm from "@/components/edit-list-item-form";
import {getListingById} from "@/lib/server-actions";

export default async function EditListItemPage({
    params,
                                         }: {
    params: any
}) {

    const data = await getListingById((await params).id)

    return (
        <ProtectedRoute>
            <EditListItemForm data={data}/>
        </ProtectedRoute>
    )
}

