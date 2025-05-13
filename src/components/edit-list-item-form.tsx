"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Camera, Loader2, X } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import {createListingAction, updateListingAction} from "@/lib/server-actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import {imageDownloadUrls} from "@/app/list-item/_utils/photo-handler";
import {MongoListingType} from "@/models/Listing";
import {
  AlertDialog, AlertDialogAction,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

export default function EditListItemForm({
    data
                                         }: {
    data: MongoListingType
}) {

  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: data.title,
    description: data.description,
    category: data.category,
    condition: data.condition,
    price: data.price.toString(),
    credits: data.credits.toString(),
    pickup_location: data.pickup_location,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to list an item",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)


    try {
      const res = await fetch(`/api/listings/${data._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await user?.getIdToken()}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update listing");
      }

      toast({
        title: "Success!",
        description: "Your item has been listed",
      });

      router.push("/");
    } catch (error) {
      console.error("Error creating listing:", error);
      toast({
        title: "Error",
        description: "There was a problem listing your item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async () => {

    await fetch(`/api/listings/${data._id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${await user?.getIdToken()}`
      }
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className={'flex space-x-4 items-center justify-between w-full'}>
        <h1 className="text-3xl font-bold mb-6">Edit a listing</h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>
              Delete Listing
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Listing</AlertDialogTitle>
              <AlertDialogDescription>Are you sure you would like to delete this listing. This action is irreversible</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>
                <Button onClick={handleDelete}>
                  Delete Listing
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">Item Title</Label>
          <Input
            id="title"
            placeholder="e.g., MacBook Pro 2021"
            required
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your item, including its condition and any relevant details."
            required
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select required value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="books">Books</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="condition">Condition</Label>
            <Select
              required
              value={formData.condition}
              onValueChange={(value) => handleSelectChange("condition", value)}
            >
              <SelectTrigger id="condition">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="like-new">Like New</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price (in $)</Label>
            <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
                value={formData.price}
                onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="credits">Price (in credits)</Label>
            <Input
                id="credits"
                type="number"
                min="0"
                placeholder="0"
                required
                value={formData.credits}
                onChange={handleChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Pickup Location</Label>
            <Input
                id="pickup_location"
                type="text"
                placeholder="100 Main St, Cityville"
                required
                value={formData.pickup_location}
                onChange={handleChange}
            />
          </div>
        </div>

        <p>Images cannot be changed once created</p>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Listing...
            </>
          ) : (
            "Edit Listing"
          )}
        </Button>
      </form>
    </div>
  )
}

