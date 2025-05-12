import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import { AuthProvider } from "@/context/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Campus Bazaar - Student-to-Student Marketplace",
  description: "Buy, sell, and trade items with other students using cash or school credits",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          {children}
          <Toaster/>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'
import {Toaster} from "@/components/ui/toaster";