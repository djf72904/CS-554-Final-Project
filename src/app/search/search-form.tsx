"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchFormProps {
  initialQuery: string
}

export default function SearchForm({ initialQuery }: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-3xl mx-auto">
      <Input
        type="text"
        placeholder="Search for items..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="rounded-r-none"
      />
      <Button type="submit" className="rounded-l-none">
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </form>
  )
}

