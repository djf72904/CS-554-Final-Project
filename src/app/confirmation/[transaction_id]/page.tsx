
import {getTransaction} from "@/lib/transactions";
import PurchaseConfirmation from "@/app/confirmation/[transaction_id]/_components/PurchaseConfirmation";
import {notFound} from "next/navigation";
import {getUserProfile} from "@/lib/users";
import ProtectedRoute from "@/components/protected-route";

export default async function PurchaseConfirmationPage({
    params,
                                                 }: {
    params: {
        transaction_id: string
    }
}) {

    const transaction = JSON.parse(await getTransaction((await params).transaction_id) ?? "")
    const seller = (await getUserProfile(transaction.sellerId))

    if(!transaction){
        return notFound()
    }

    return <ProtectedRoute>
        <PurchaseConfirmation transaction={transaction} seller={seller}/>
    </ProtectedRoute>
}
