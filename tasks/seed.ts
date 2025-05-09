import mongoose from "mongoose"
import User from "@/models/User"
import Listing from "@/models/Listing"

async function seedDatabase() {
    try {
        const uri = "mongodb://localhost:27017/"
        await mongoose.connect(uri)
        console.log("✅ Connected to MongoDB: test")

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
        })

        const user2 = await User.create({
            uid: "user-002",
            displayName: "Alyssa Castillo",
            email: "acastil4@stevens.edu",
            school: "Stevens Institute of Technology",
            credits: 50,
        })

        const user3 = await User.create({
            uid: "user-003",
            displayName: "Jack Patterson",
            email: "jpatter2@stevens.edu",
            school: "Stevens Institute of Technology",
            credits: 500,
        })

        const user4 = await User.create({
            uid: "user-004",
            displayName: "Dylan Faulhaber",
            email: "dfaulhab@stevens.edu",
            school: "Stevens Institute of Technology",
            credits: 275,
        })

        // Seed Listings
        await Listing.create([
            {
                title: "Calculus Textbook",
                description: "Used but in good condition. Great for first-year students.",
                category: "Books",
                condition: "Good",
                price: 25,
                credits: 10,
                images: [],
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
                userId: user1.uid,
                school: user1.school,
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

        console.log("✅ Seeded users and listings")
    } catch (err) {
        console.error("❌ Error seeding database:", err)
    } finally {
        await mongoose.disconnect()
        console.log("Disconnected")
        process.exit(0)
    }
}

seedDatabase()
