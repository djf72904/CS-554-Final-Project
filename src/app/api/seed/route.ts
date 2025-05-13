import {NextRequest, NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";
import User, {MongoUserType} from "@/models/User";
import Listing, {MongoListingType} from "@/models/Listing";
import {updateUserProfile} from "@/lib/users";
import PaymentMethods from "@/models/PaymentMethods";
import Message from "@/models/Message";
import Transaction from "@/models/Transaction";
import mongoose from "mongoose";
import {getAllTransactions} from "@/lib/transactions";

export async function POST(request: NextRequest) {

    const token = request.headers.get("Authorization")?.split("Bearer ")[1]

    if (!token && token !== 'bbae9587-5b23-4cd0-9411-c42a361a6f10') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }


    await dbConnect();

    try {
        console.log("deleting info already in db")
        await User.deleteMany({})
        await Listing.deleteMany({})
        await Message.deleteMany({})
        await Transaction.deleteMany({})
        await PaymentMethods.deleteMany({})

        // Seed Users
        const user1 = await User.create({
            uid: "user-001",
            displayName: "Adian Ruck",
            email: "aruck1@stevens.edu",
            school: "Stevens Institute of Technology",
            credits: 100,
            rating: 0,
            balance: 1000,
            likedPosts: [],
            mfaEnabled: false,
            totpSecret: null
        })

        const user2 = await User.create({
            uid: "user-002",
            displayName: "John Doe",
            email: "jdoe12@stevens.edu",
            school: "Stevens Institute of Technology",
            credits: 50,
            rating: 0,
            balance: 1000,
            likedPosts: [],
            mfaEnabled: false,
            totpSecret: null
        })

        const user3 = await User.create({
            uid: "user-003",
            displayName: "Alex Jones",
            email: "ajones123@stevens.edu",
            school: "Stevens Institute of Technology",
            credits: 500,
            rating: 0,
            balance: 1000,
            likedPosts: [],
            mfaEnabled: false,
            totpSecret: null
        })

        const user4 = await User.create({
            uid: "user-004",
            displayName: "Nick Adams",
            email: "nadams33@stevens.edu",
            school: "Stevens Institute of Technology",
            credits: 275,
            rating: 0,
            balance: 1000,
            likedPosts: [],
            mfaEnabled: false,
            totpSecret: null
        })

        const user5 = await User.create({
            uid: "user-005",
            displayName: "ColumbiaMan",
            email: "randomGuy@columia.edu",
            school: "Columbia University",
            credits: 500,
            rating: 0,
            balance: 1000,
            likedPosts: [],
            mfaEnabled: false,
            totpSecret: null
        })

        const user6 = await User.create({
            uid: "user-006",
            displayName: "njitGirl",
            email: "randomGirl@njit.edu",
            school: "New Jersey Institute of Technology",
            credits: 500,
            rating: 0,
            balance: 1000,
            likedPosts: [],
            mfaEnabled: false,
            totpSecret: null
        })

        // Seed Listings
        const activeListings = await Listing.create([
            {
                title: "Calculus Textbook",
                description: "Used but in good condition. Great for first-year students.",
                category: "Books",
                condition: "Good",
                price: 25,
                credits: 10,
                images: ["/listings/calcBook.png", "/listings/calcBook2.png"],
                userId: user1.uid,
                school: user1.school,
                status: "active",
                pickup_location: "UCC",
            },
            {
                title: "Noise Cancelling Headphones",
                description: "Barely used. Excellent for studying.",
                category: "Electronics",
                condition: "Like New",
                price: 75,
                credits: 30,
                images: ["/listings/headphones.png"],
                userId: user2.uid,
                school: user2.school,
                status: "active",
                likes: ["user-001", "user-003"],
                pickup_location: "Babbio Center",
            },
            {
                title: "TI-84 Plus Calculator",
                description: "Perfect for exams. No wear or scratches.",
                category: "Electronics",
                condition: "Excellent",
                price: 50,
                credits: 20,
                images: ["/listings/ti-84_plus.png", "/listings/ti-84_plus2.png"],
                userId: user4.uid,
                school: user4.school,
                status: "active",
                pickup_location: "UCC",
            },
            {
                title: "Couch",
                description: "Four seater comfy couch. Great for getting cozy and watching a movie with friends",
                category: "Furniture",
                condition: "Worn",
                price: 75,
                credits: 50,
                images: ["/listings/couch.png"],
                userId: user3.uid,
                school: user3.school,
                status: "active",
                likes: ["user-004", "user-001", "user-002"],
                pickup_location: "EAS Building",
            },
            {
                title: "Macbook Pro",
                description: "Used Macbook through final 2 years of school. No longer needed",
                category: "Electronics",
                condition: "Good",
                price: 200,
                credits: 100,
                images: ["/listings/macbook.png", "/listings/macbook2.png"],
                userId: user6.uid,
                school: user6.school,
                status: "active",
                pickup_location: "Newark Penn Station",
            },
            {
                title: "Salty Crew Shirt",
                description: "I never wear this anymore",
                category: "Clothing",
                condition: "OK",
                price: 20,
                credits: 15,
                images: ["/listings/saltyCrew.png", "/listings/saltyCrew2.png"],
                userId: user5.uid,
                school: user5.school,
                status: "active",
                likes: ["user-005"],
                pickup_location: "New York Penn Station",
            },
        ])

        const soldListings = await Listing.create([
            {
                title: "Columbia Sweatshirt",
                description: "Never-worn. Show your Lion pride!",
                category: "Clothing",
                condition: "New",
                price: 45,
                credits: 15,
                images: ["/listings/columbiaShirt.png"],
                userId: user5.uid,
                school: user5.school,
                status: "sold",
                pickup_location: "Battery Park",
                overlaySold: "/listings/columbiaShirt_sold.png",
            },
            {
                title: "Phone Case",
                description: "Slightly used. Small scratches",
                category: "Electronics",
                condition: "Used",
                price: 15,
                credits: 7,
                images: ["/listings/phoneCase.png"],
                userId: user1.uid,
                school: user1.school,
                status: "sold",
                pickup_location: "Castle Point Hall",
                overlaySold: "/listings/phoneCase_sold.png",
            },
            {
                title: "The Catcher in the Rye",
                description: "Heavily Used. Was my grandmother's",
                category: "Clothing",
                condition: "Old",
                price: 10,
                credits: 5,
                images: ["/listings/catcherInRye.png"],
                userId: user4.uid,
                school: user4.school,
                status: "sold",
                pickup_location: "EAS Building",
                overlaySold: "/listings/catcherInRye_sold.png",
            },
        ])
        await updateUserProfile(user1.uid, {likedPosts: [activeListings[1]._id, activeListings[3]._id ]})
        await updateUserProfile(user2.uid, {likedPosts: [activeListings[3]._id]})
        await updateUserProfile(user3.uid, {likedPosts: [activeListings[1]._id]})
        await updateUserProfile(user4.uid, {likedPosts: [activeListings[3]._id]})
        await updateUserProfile(user5.uid, {likedPosts: [activeListings[5]._id]})

        const transactions = await Transaction.create([
            {
                buyerId: user6.uid,
                sellerId: user5.uid,
                listingId: soldListings[0]._id,
                amount: 45,
                credits: 15,
                paymentMethod: "card",
                status: "complete",
                rating: 4,
                review: "Very nice and flexible with pickup! Bought for my brother!"
            },
            {
                buyerId: user2.uid,
                sellerId: user1.uid,
                listingId: soldListings[1]._id,
                amount: 15,
                credits: 7,
                paymentMethod: "credit",
                status: "complete",
                rating: 5,
                review: "Much better condition than expected! Thanks for letting me use DuckBills!"
            },
            {
                buyerId: user3.uid,
                sellerId: user4.uid,
                listingId: soldListings[2]._id,
                amount: 10,
                credits: 5,
                paymentMethod: "card",
                status: "complete",
                rating: 3,
                review: "Very old book but I love it. Love the history but wish it was in better condition."
            }
        ])

        async function updateUserReviews(soldTransactions: any){
            for (let i=0; i<soldTransactions.length; i++){
                let ratingSum = 0;
                let currSellerId = soldTransactions[i].sellerId;
                let sellerTransactionNum = 0;
                for (let j=0; j<soldTransactions.length; j++) {
                    if(soldTransactions[j].sellerId === currSellerId){
                        ratingSum += soldTransactions[j].rating
                        sellerTransactionNum++;
                    }
                }
                let finalRating = ratingSum / sellerTransactionNum;

                const newRatingData = {
                    rating: finalRating,
                }

               await updateUserProfile(currSellerId, newRatingData)
            }
        }

        await updateUserReviews(transactions)

        console.log("Done seeding db")

        return NextResponse.json({ status: 200 })

    } catch (err) {
        console.error("Error seeding db:", err);
        return NextResponse.json(
            { error: "Failed to seed Database" },
            { status: 500 }
        );
    }
}