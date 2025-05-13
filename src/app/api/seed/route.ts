import {NextRequest, NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Listing from "@/models/Listing";
import {updateUserProfile} from "@/lib/users";
import PaymentMethods from "@/models/PaymentMethods";
import Message from "@/models/Message";
import Transaction from "@/models/Transaction";

export async function POST(request: NextRequest) {

    const token = request.headers.get("Authorization")?.split("Bearer ")[1]

    if (!token && token !== 'bbae9587-5b23-4cd0-9411-c42a361a6f10') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }


    await dbConnect();

    try {

        await User.deleteMany({})
        await Listing.deleteMany({})
        await Message.deleteMany({})
        await Transaction.deleteMany({})
        await PaymentMethods.deleteMany({})

        // Seed Users
        const user1 = await User.create({
            uid: "user-001",
            displayName: "Divya Prahlad",
            email: "dprahlad@stevens.edu",
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
            displayName: "Alyssa Castillo",
            email: "acastil4@stevens.edu",
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
            displayName: "Jack Patterson",
            email: "jpatter2@stevens.edu",
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
            displayName: "Dylan Faulhaber",
            email: "dfaulhab@stevens.edu",
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
                images: ["/public/listings/calcBook.png", "/public/listings/calcBook2.png"],
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
                images: ["/public/listings/headphones.png"],
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
                images: ["/public/listings/ti-84_plus.png", "/public/listings/ti-84_plus2.png"],
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
                images: ["/public/listings/couch.png"],
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
                images: ["/public/listings/macbook.png", "/public/listings/macbook2.png"],
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
                images: ["/public/listings/saltyCrew.png", "/public/listings/saltyCrew2.png"],
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
                images: ["/public/listings/columbiaShirt.png"],
                userId: user5.uid,
                school: user5.school,
                status: "sold",
                pickup_location: "Battery Park",
                overlaySold: "/public/listings/columbiaShirt_sold.png",
            },
            {
                title: "Phone Case",
                description: "Slightly used. Small scratches",
                category: "Electronics",
                condition: "Used",
                price: 15,
                credits: 7,
                images: ["/public/listings/phoneCase.png"],
                userId: user1.uid,
                school: user1.school,
                status: "sold",
                pickup_location: "Castle Point Hall",
                overlaySold: "/public/listings/phoneCase_sold.png",
            },
            {
                title: "The Catcher in the Rye",
                description: "Heavily Used. Was my grandmother's",
                category: "Clothing",
                condition: "Old",
                price: 10,
                credits: 5,
                images: ["/public/listings/catcherInRye.png"],
                userId: user4.uid,
                school: user4.school,
                status: "sold",
                pickup_location: "EAS Building",
                overlaySold: "/public/listings/catcherInRye_sold.png",
            },
        ])
        await updateUserProfile(user1.uid, {likedPosts: [activeListings[1]._id, activeListings[3]._id ]})
        await updateUserProfile(user2.uid, {likedPosts: [activeListings[3]._id]})
        await updateUserProfile(user3.uid, {likedPosts: [activeListings[1]._id]})
        await updateUserProfile(user4.uid, {likedPosts: [activeListings[3]._id]})
        await updateUserProfile(user5.uid, {likedPosts: [activeListings[5]._id]})


    } catch (err) {
        console.error("Error toggling like:", err);
        return NextResponse.json(
            { error: "Failed to save or unsave listing" },
            { status: 500 }
        );
    }
}