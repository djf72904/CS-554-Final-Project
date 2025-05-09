import dbConnect from "@/lib/mongoose";
import PaymentMethods, {MongoPaymentMethodsType} from "@/models/PaymentMethods";
import User, {MongoUserType} from "@/models/User";
import Listing, {MongoListingType} from "@/models/Listing";

export const savedListingsByUser = async (userId: string) => {
    await dbConnect()

    const user = await User.findOne({ uid: userId })

    if(!user){
        throw new Error("No user found")
    }

    // const saved = Listing.find( { _id: { $in: user.likedPosts } } )


    return JSON.stringify([])
}