import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import ProtectedRoute from "@/components/protected-route"
import ProfileContent from "./profile-content"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileContent />
        </Suspense>
      </div>
    </ProtectedRoute>
  )
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* User Info Card Skeleton */}
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-5 w-40" />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>

      {/* Stats and Listings Skeleton */}
      <div className="flex-[2]">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Listings Tabs Skeleton */}
        <Tabs defaultValue="listings">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="purchases">My Purchases</TabsTrigger>
          </TabsList>
          <TabsContent value="listings" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="p-0">
                    <Skeleton className="aspect-square rounded-t-lg" />
                  </CardHeader>
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

