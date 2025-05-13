import mongoose from "mongoose"
import User from "@/models/User"
import Listing from "@/models/Listing"
import Transaction from "@/models/Transaction"

async function seedDatabase() {
    try {
        const uri = "mongodb://localhost:27017/"
        await mongoose.connect(uri)
        console.log("Connected to MongoDB: test")

        //Clear old data
        await User.deleteMany({})
        await Listing.deleteMany({})

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

        // Seed Listings
        const listing = await Listing.create(
            {
                title: "Calculus Textbook",
                description: "Used but in good condition. Great for first-year students.",
                category: "Books",
                condition: "Good",
                price: 25,
                credits: 10,
                images: [],
                userId: user2.uid,
                school: user2.school,
                status: "active",
                pickup_location: "UCC",
            }
        )

        await Listing.create([
            {
                title: "Noise Cancelling Headphones",
                description: "Barely used. Excellent for studying.",
                category: "Electronics",
                condition: "Like New",
                price: 75,
                credits: 30,
                images: [],
                userId: user2.uid,
                school: user2.school,
                status: "active",
                pickup_location: "UCC",
            },
            {
                title: "TI-84 Plus Calculator",
                description: "Perfect for exams. No wear or scratches.",
                category: "Electronics",
                condition: "Excellent",
                price: 50,
                credits: 20,
                images: [],
                userId: user4.uid,
                school: user4.school,
                status: "pending",
                pickup_location: "UCC",
            },
            {
                title: "Couch",
                description: "Four seater comfy couch. Great for getting cozy and watching a movie with friends",
                category: "Furniture",
                condition: "Excellent",
                price: 75,
                credits: 50,
                images: [],
                userId: user3.uid,
                school: user3.school,
                status: "pending",
                pickup_location: "UCC",
            }
        ])

        console.log("Seeded users, listings, transaction")
    } catch (err) {
        console.error("Error seeding database:", err)
    } finally {
        await mongoose.disconnect()
        console.log("Disconnected")
        process.exit(0)
    }
}

seedDatabase()
