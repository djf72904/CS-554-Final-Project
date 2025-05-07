"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User as UserType,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getUserProfile, getUserByEmail, type UserProfile } from "@/lib/user-service"
import { useRouter } from "next/navigation"
import searchColleges from "@/lib/college";
import type {User as FirebaseUser} from "@firebase/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User"


async function createUserProfile(user: FirebaseUser): Promise<any> {
  try {
    const token = await user.getIdToken()
    const response = await fetch("/api/users/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        school: user.email?.split("@")[1]?.split(".edu")[0] || "",
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create user profile")
    }

    const data = await response.json()
    return data.user
  } catch (error) {
    console.error("Error creating user profile:", error)
    return null
  }
}

interface AuthContextType {
  user: UserType | null
  userProfile: UserProfile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  school: string
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  school: '',
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [school, setSchool] = useState('')
  const router = useRouter()


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        if (user.email) {
          searchColleges.byDomain(user.email.split('@')[1]).then((res) => {
            setSchool(res[0].name)
          })
        } else {
          setSchool('')
        }

        try {
          await createUserProfile(user)
          const profile = await getUserProfile(user.uid)
          setUserProfile(profile)
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      } else {
        setUserProfile(null)
        setSchool('')
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })

      const result = await signInWithPopup(auth, provider)

      if (result.user.email?.endsWith(".edu")) {
        const profile = await getUserByEmail(result.user.email)
        if(!profile) {
          await createUserProfile(result.user)
        }
        const finalProfile = profile || await getUserByEmail(result.user.email)
        setUserProfile(finalProfile)
        router.push("/")
      } else {
        await firebaseSignOut(auth)
        alert("Please sign in with a .edu email address")
        setSchool('')
        setUserProfile(null)
      }
    } catch (error) {
      console.error("Error signing in with Google", error)
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUserProfile(null)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        signOut,
        school: school,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

