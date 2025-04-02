"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Camera, Loader2, X } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { createListingAction } from "@/lib/server-actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"

export default function ListItemForm() {
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    price: "",
    credits: "",
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      setImages((prevImages) => [...prevImages, ...fileArray])

      // Create preview URLs
      const newImageUrls = fileArray.map((file) => URL.createObjectURL(file))
      setImageUrls((prevUrls) => [...prevUrls, ...newImageUrls])
    }
  }

  const removeImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index))

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imageUrls[index])
    setImageUrls((prevUrls) => prevUrls.filter((_, i) => i !== index))
  }

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
      // Upload images to Firebase Storage
      const imageDownloadUrls = await Promise.all(
        images.map(async (image) => {
          const storageRef = ref(storage, `listings/${user.uid}/${Date.now()}-${image.name}`)
          const snapshot = await uploadBytes(storageRef, image)
          return getDownloadURL(snapshot.ref)
        }),
      )

      // Create listing using server action
      await createListingAction(
        {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          condition: formData.condition,
          price: Number.parseFloat(formData.price),
          credits: Number.parseInt(formData.credits),
          images: imageDownloadUrls,
          school: userProfile?.school || "",
        },
        user.uid,
      )

      toast({
        title: "Success!",
        description: "Your item has been listed",
      })

      router.push("/")
    } catch (error) {
      console.error("Error creating listing:", error)
      toast({
        title: "Error",
        description: "There was a problem listing your item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">List an Item for Sale</h1>
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

        <div className="space-y-2">
          <Label>Images</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {imageUrls.map((imageUrl, index) => (
              <div key={index} className="relative aspect-square">
                <Image
                  src={imageUrl || "https://www.signfix.com.au/wp-content/uploads/2017/09/placeholder-600x400.png"}
                  alt={`Uploaded image ${index + 1}`}
                  fill
                  className="object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <label className="border-2 border-dashed border-gray-300 rounded-md aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
              <Camera className="h-8 w-8 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">Add Image</span>
              <Input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Listing Item...
            </>
          ) : (
            "List Item"
          )}
        </Button>
      </form>
    </div>
  )
}

