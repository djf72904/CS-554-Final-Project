
import type React from "react"
import {ProfileEdit} from "@/app/profile/edit/_components/ProfileEdit";
import {getPaymentMethods} from "@/lib/payment-methods";
import {getCurrentUser} from "@/lib/auth";
import {notFound} from "next/navigation";
import {MongoPaymentMethodsType} from "@/models/PaymentMethods";
import {getUserProfile} from "@/lib/users";

export default async function ProfileEditPage() {

    const user = await getCurrentUser()

    if (!user) {
        return notFound()
    }

    const currUserDisplayName = ((await getUserProfile(user.id))).displayName;

    const payment_methods: MongoPaymentMethodsType[] = JSON.parse(await getPaymentMethods(user?.id))



    return <ProfileEdit oldDisplayName={currUserDisplayName} payment_methods={payment_methods}/>
}
