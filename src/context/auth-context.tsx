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
import {
  getUserProfile,
  getUserByEmail,
  type UserProfile,
  createUserProfile,
} from "@/lib/users"
import { useRouter } from "next/navigation"
import type { User as FirebaseUser } from "@firebase/auth"
import {deleteCookie, getCookie, setCookie} from "cookies-next"
import searchColleges from "@/lib/college"

interface AuthContextType {
  user: UserType | null
  userProfile: UserProfile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  school: string
  needsMfa: boolean
  setNeedsMfa: (val: boolean) => void
  pendingMfaUser: FirebaseUser | null
  setPendingMfaUser: (user: FirebaseUser | null) => void
  setUserProfile: (profile: UserProfile | null) => void
  setUser: (user: UserType | null) => void
  setSchool: any
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  school: '',
  needsMfa: false,
  setNeedsMfa: () => {},
  pendingMfaUser: null,
  setPendingMfaUser: () => {},
  setUserProfile: () => {},
  setUser: () => {},
  setSchool: () => {}
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [school, setSchool] = useState('')
  const [needsMfa, setNeedsMfa] = useState(false)
  const [pendingMfaUser, setPendingMfaUser] = useState<FirebaseUser | null>(null)

  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser?.email?.endsWith('.edu')) {
        setLoading(false)
        return
      }

      try {
        const profile = await getUserByEmail(firebaseUser.email)
        const hasMFA = getCookie('auth-token-mfa')

        if (profile?.mfaEnabled && !hasMFA) {
          setPendingMfaUser(firebaseUser)
          setNeedsMfa(true)
          setLoading(false)
          return
        }

        await completeLogin(firebaseUser)
      } catch (err) {
        console.error('Auth error:', err)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const completeLogin = async (firebaseUser: FirebaseUser) => {
    try {
      setUser(firebaseUser)

      const token = await firebaseUser.getIdToken()
      setCookie('auth-token', token, {
        maxAge: 60 * 60,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })

      if (firebaseUser.email) {
        const domain = firebaseUser.email.split('@')[1]
        const college = await searchColleges.byDomain(domain)
        setSchool(college?.[0]?.name || '')
        const profile = (await getUserProfile(firebaseUser.uid))
        if(!profile){
          await createUserProfile({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
          })
          setUserProfile(profile)
        }
        else{
          setUserProfile(profile)
        }
      }


    } catch (err) {
      console.error("Failed during login:", err)
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })
      const result = await signInWithPopup(auth, provider)
      const firebaseUser = result.user

      if (!firebaseUser.email?.endsWith(".edu")) {
        await firebaseSignOut(auth)
        alert("Please sign in with a .edu email address")
        return
      }

      const profile = await getUserByEmail(firebaseUser.email)
      if (profile?.mfaEnabled) {
        setPendingMfaUser(firebaseUser)
        setNeedsMfa(true)
        return
      }

      await completeLogin(firebaseUser)
      router.push('/')
    } catch (error) {
      console.error("Error signing in with Google", error)
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setUserProfile(null)
      setSchool('')
      setNeedsMfa(false)
      setPendingMfaUser(null)
      deleteCookie('auth-token')
      deleteCookie('auth-token-mfa')
      router.push('/')
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
            school,
            needsMfa,
            setNeedsMfa,
            pendingMfaUser,
            setPendingMfaUser,
            setUserProfile,
            setUser,
            setSchool
          }}
      >
        {children}
      </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)