import PaymentMethods, {MongoPaymentMethodsType} from "@/models/PaymentMethods";
import dbConnect from "@/lib/mongoose";
import CryptoJS from "crypto-es"

export const getPaymentMethods = async (userId: string) => {
    await dbConnect()

    const paymentMethods = await PaymentMethods.find({ userId }).sort({ createdAt: -1 }).lean()
    for(let i=0; i<paymentMethods.length; i++) {
        let pm = paymentMethods[i];
        let decryptedData = {
            _id: pm._id,
            userId: pm.userId,
            billingName: (Buffer.from(CryptoJS.AES.decrypt(pm.billingName, pm.userId).toString(), "hex")).toString(),
            cardNumber: (Buffer.from(CryptoJS.AES.decrypt(pm.cardNumber, pm.userId).toString(), "hex")).toString(),
            expirationDate: (Buffer.from(CryptoJS.AES.decrypt(pm.expirationDate, pm.userId).toString(), "hex")).toString(),
            cvv: (Buffer.from(CryptoJS.AES.decrypt(pm.cvv, pm.userId).toString(), "hex")).toString(),
            last4: pm.last4,
            __v: 0
        }
        paymentMethods[i] = decryptedData;
    }
    return JSON.stringify(paymentMethods as unknown as MongoPaymentMethodsType[])
}

export const createPaymentMethod = async (data: Pick<MongoPaymentMethodsType, 'cardNumber' | 'createdAt' | 'userId' | 'cvv' | "last4" | 'expirationDate' | 'billingName'>) => {
    await dbConnect()

    const encryptedData = {
        userId: data.userId,
        cardNumber: CryptoJS.AES.encrypt(data.cardNumber, data.userId),
        billingName: CryptoJS.AES.encrypt(data.billingName, data.userId),
        expirationDate: CryptoJS.AES.encrypt(data.expirationDate, data.userId),
        cvv: CryptoJS.AES.encrypt(data.cvv, data.userId),
        last4: data.cardNumber.slice(-4)
    }

    const newPaymentMethod = new PaymentMethods({
        ...encryptedData,
    })

    const savedPaymentMethod = await newPaymentMethod.save()
    return savedPaymentMethod.toJSON() as unknown as MongoPaymentMethodsType
}