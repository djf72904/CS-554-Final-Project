"use client"

import type React from "react"

import { useEffect } from "react"
import {useRouter} from "next/navigation"
import { useAuth } from "@/context/auth-context"
import {EyeOff, Loader} from "lucide-react";
import {Button} from "@/components/ui/button";
import {router} from "next/client";

export default function ProtectedRoute({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, loading } = useAuth()
  const router = useRouter()

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
    return <section className='py-4 overflow-hidden h-full flex flex-col items-center justify-center'>
      <div className='container px-4 mx-auto'>
        <div className='px-6 pt-5 rounded-xl'>
          <div className='max-w-sm py-16 mx-auto text-center'>
            <div
                className={
                      'flex items-center justify-center mx-auto mb-6 w-16 h-16 bg-gray-100 rounded-full'
                }
            >
              <EyeOff size={24} />
            </div>
            <h1 className='mb-2 text-lg font-heading'>Unauthorized</h1>
            <p className='mb-6 description'>You are not allowed to be viewing this page</p>
            <Button onClick={()=>{
              router.push("/")
            }}>Go Home</Button>
          </div>
        </div>
      </div>
    </section>
  }

  return <>{children}</>
}

