import PaymentMethods, {MongoPaymentMethodsType} from "@/models/PaymentMethods";
import dbConnect from "@/lib/mongoose";

export const getPaymentMethods = async (userId: string) => {
    await dbConnect()

    const paymentMethods = await PaymentMethods.find({ userId }).sort({ createdAt: -1 }).lean()
    return JSON.stringify(paymentMethods as unknown as MongoPaymentMethodsType[])
}

export const createPaymentMethod = async (data: Pick<MongoPaymentMethodsType, 'cardNumber' | 'createdAt' | 'userId' | 'cvv' | 'expirationDate' | 'billingName'>) => {
    await dbConnect()

    const newPaymentMethod = new PaymentMethods({
        ...data,
    })

    const savedPaymentMethod = await newPaymentMethod.save()
    return savedPaymentMethod.toJSON() as unknown as MongoPaymentMethodsType
}