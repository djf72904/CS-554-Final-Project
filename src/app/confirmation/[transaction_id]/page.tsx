
import {PurchaseConfirmation} from "@/app/confirmation/[transaction_id]/_components/PurchaseConfirmation";
import {getTransaction} from "@/lib/transactions";

export default function PurchaseConfirmationPage({
    params,
                                                 }: {
    params: {
        transaction_id: string
    }
}) {
    const transaction = getTransaction(params.transaction_id)

    return <PurchaseConfirmation transaction={transaction}/>
}
