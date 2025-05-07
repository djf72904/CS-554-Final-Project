
import type React from "react"
import {ProfileEdit} from "@/app/profile/edit/_components/ProfileEdit";
import {getPaymentMethods} from "@/lib/payment-methods";
import {getCurrentUser} from "@/lib/auth";
import {notFound} from "next/navigation";
import {MongoPaymentMethodsType} from "@/models/PaymentMethods";

export default async function ProfileEditPage() {

    const user = await getCurrentUser()

    if (!user) {
        return notFound()
    }

    const payment_methods: MongoPaymentMethodsType[] = JSON.parse(await getPaymentMethods(user?.id))


    return <ProfileEdit payment_methods={payment_methods}/>
}
