"use client"

import type React from "react"

import { useEffect } from "react"
import {unauthorized, useRouter} from "next/navigation"
import { useAuth } from "@/context/auth-context"
import Loading from "@/app/loading";
import {Loader} from "lucide-react";

export default function ProtectedRoute({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <Loader className={'w-12 h-12'}/>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push("/login")
  }

  return <>{children}</>
}

