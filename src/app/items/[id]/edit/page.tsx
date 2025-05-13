import ProtectedRoute from "@/components/protected-route"
import EditListItemForm from "@/components/edit-list-item-form";
import {getListingById} from "@/lib/server-actions";
import {getCurrentUser} from "@/lib/auth";
import {notFound, unauthorized} from "next/navigation";

export default async function EditListItemPage({
    params,
                                         }: {
    params: any
}) {

    const user = await getCurrentUser()
    const data = await getListingById((await params).id)
    if(data.sellerId !== user?.id){
        return unauthorized()
    }

    return (
        <ProtectedRoute>
            <EditListItemForm data={data}/>
        </ProtectedRoute>
    )
}

