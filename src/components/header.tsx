"use client"

import Link from "next/link"
import {Globe, Menu, Search, LogOut, PlusCircle, User, ShoppingCart} from "lucide-react"
import { useAuth } from "@/context/auth-context"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const { user, signOut, school } = useAuth()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <div className={'bg-rose-500 text-white p-2 rounded-md'}>
            <ShoppingCart size={14} />
          </div>

          <span className="ml-2 text-xl font-semibold text-rose-500">Campus Bazaar</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/list-item">
                <Button variant="ghost" className="hidden md:flex items-center gap-2 rounded-full">
                  <span className="text-sm font-medium">List your item</span>
                </Button>
              </Link>
                <div className="hidden md:flex items-center ">
                  <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">{school}</span>
                </div>
                <div className="flex items-center md:hidden">
                  <span className="text-xs  font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">{school.split(" ").map((wrds)=>wrds[0]).filter(wrds=>wrds?.match(/^[A-Z]/)).join("")}</span>
                </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center border rounded-full p-1 shadow-sm cursor-pointer">
                    <Menu className="h-5 w-5 ml-2" />
                    <Avatar className="ml-2 h-8 w-8">
                      <AvatarFallback className="bg-slate-100">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex w-full items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/list-item" className="cursor-pointer flex w-full items-center">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      <span>List an Item</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login">
              <Button className={'rounded-full'}>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

