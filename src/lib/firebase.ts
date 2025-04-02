import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC6ApOn7uQmr_rILcgABasIlZ7-bfLMWdA",
    authDomain: "campus-bazaar-2e0ee.firebaseapp.com",
    projectId: "campus-bazaar-2e0ee",
    storageBucket: "campus-bazaar-2e0ee.firebasestorage.app",
    messagingSenderId: "290517354667",
    appId: "1:290517354667:web:7e49d96d5697b94bb4cfee"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const storage = getStorage(app)

export { app, auth, storage }
