import mongoose, { Schema, type Document } from "mongoose"

export interface MongoPaymentMethodsType extends Document {
    userId: string
    billingName: string
    cardNumber: string
    expirationDate: string
    cvv: string
    last4: string
    createdAt: Date
}

const PaymentMethodSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    billingName: { type: String, required: true },
    cardNumber: { type: String, required: true },
    expirationDate: { type: String, required: true },
    cvv: { type: String, required: true },
    last4: {type: String, required: true},
    createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.PaymentMethods || mongoose.model<MongoPaymentMethodsType>("PaymentMethods", PaymentMethodSchema)

