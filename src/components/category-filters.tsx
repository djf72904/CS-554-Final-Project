"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import React, {useCallback, useState} from "react";
import {searchListings} from "@/lib/server-actions";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {capitalizeFirstLetter} from "@/lib/text";

export default function CategoryFilters({schools}: Readonly<{ schools: string[] }>) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams.get("category") || "all"
  const [search, setSearch] = useState<any>(searchParams.get('search') ?? "")

  const handleCategoryChange = (value: string) => {
    if (value === "all") {
      router.push("/")
    } else {
      router.push(`/?category=${value}`)
    }
  }

  const handleSearch = useCallback(async(e: any) => {
    e.preventDefault();
    const base_url = window.location.origin;
     await searchListings(search ?? '', base_url)
    router.push(`/?category=${category}&search=${search}`)
  }, [search, router])


    const handleSchoolChange = (value: string) => {
        router.push(`/?category=${category}&school=${value}`)
    }

  return (
    <div className="flex justify-between w-full overflow-x-auto pb-4 no-scrollbar items-center">
      <Tabs value={category} onValueChange={handleCategoryChange} className="w-full">
        <TabsList className="flex w-full justify-start h-auto bg-transparent p-0 gap-8">
          <TabsTrigger
            value="all"
            className="flex flex-col items-center gap-2 px-1 py-2 data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none"
          >
            <div className="p-2 rounded-lg bg-slate-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                <path d="M12 3v6" />
              </svg>
            </div>
            <span className="text-xs">All</span>
          </TabsTrigger>
          <TabsTrigger
            value="books"
            className="flex flex-col items-center gap-2 px-1 py-2 data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none"
          >
            <div className="p-2 rounded-lg bg-slate-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
            </div>
            <span className="text-xs">Books</span>
          </TabsTrigger>
          <TabsTrigger
            value="electronics"
            className="flex flex-col items-center gap-2 px-1 py-2 data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none"
          >
            <div className="p-2 rounded-lg bg-slate-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <line x1="8" x2="16" y1="21" y2="21" />
                <line x1="12" x2="12" y1="17" y2="21" />
              </svg>
            </div>
            <span className="text-xs">Electronics</span>
          </TabsTrigger>
          <TabsTrigger
            value="furniture"
            className="flex flex-col items-center gap-2 px-1 py-2 data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none"
          >
            <div className="p-2 rounded-lg bg-slate-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M20 10V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
                <path d="M20 14v-4H4v4" />
                <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
                <path d="M12 10v6" />
                <path d="M2 10h20" />
              </svg>
            </div>
            <span className="text-xs">Furniture</span>
          </TabsTrigger>
          <TabsTrigger
            value="clothing"
            className="flex flex-col items-center gap-2 px-1 py-2 data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none"
          >
            <div className="p-2 rounded-lg bg-slate-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M3 6.2c0 1 .8 1.8 1.8 1.8h14.4c1 0 1.8-.8 1.8-1.8 0-1-.8-1.8-1.8-1.8H4.8C3.8 4.4 3 5.2 3 6.2Z" />
                <path d="m4 11 8 2 8-2" />
                <path d="M8 5v14" />
                <path d="M16 5v14" />
                <path d="M6 19h12" />
              </svg>
            </div>
            <span className="text-xs">Clothing</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Select onValueChange={handleSchoolChange} value={searchParams.get('school') ?? ''}>
        <SelectTrigger id="category" className={'w-64 mr-4'}>
          <SelectValue placeholder="Select a School" />
        </SelectTrigger>
        <SelectContent>
          {
            schools?.map(school=>{
             return <SelectItem key={school} value={school}>{capitalizeFirstLetter(school)}</SelectItem>
            })
          }
        </SelectContent>
      </Select>
      <form onSubmit={handleSearch} className={'flex space-x-2'}>
        <Input placeholder={'Search Listings By Name or School'} value={search} onChange={(e)=>setSearch(e.target.value)} className={'rounded-full w-72'}/>
        <Button type={'submit'}>Search</Button>
      </form>
    </div>
  )
}

