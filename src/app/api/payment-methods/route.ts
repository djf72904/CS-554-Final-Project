import {NextRequest, NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Listing from "@/models/Listing";
import {createPaymentMethod} from "@/lib/payment-methods";
import PaymentMethods, {MongoPaymentMethodsType} from "@/models/PaymentMethods";

export async function POST(request: NextRequest) {
    await dbConnect();

    try {
        const { data } = await request.json();

        const user = await User.findOne({ uid: data?.userId });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const usersCards = await PaymentMethods.find(
            { userId: data?.userId,
                cardNumber: data.cardNumber,
                expirationDate: data.expirationDate,
            },
        )

        if(usersCards.length > 0) {
            return NextResponse.json({ error: "Payment method already exists" }, { status: 409 });
        }

        const res = await createPaymentMethod(data)

        if (!res) {
            return NextResponse.json({ error: "Failed to create payment method" }, { status: 500 });
        }

        return NextResponse.json({ paymentMethod: res }, { status: 201 });

    } catch (err) {
        console.error("Error creating payment method:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest){
    await dbConnect();

    try {
        const { payment_method_id } = await request.json();

        const paymentMethod = await PaymentMethods.findById(payment_method_id);
        if (!paymentMethod) {
            return NextResponse.json({ error: "Payment method not found" }, { status: 404 });
        }

        await PaymentMethods.deleteOne({ _id: payment_method_id });

        return NextResponse.json({ message: "Payment method deleted successfully" }, { status: 200 });

    } catch (err) {
        console.error("Error deleting payment method:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}