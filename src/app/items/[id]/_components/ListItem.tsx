import {ListingItem} from "@/app/items/_components/ListingItem";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import PurchaseOptions from "@/app/items/_components/purchase-options";
import {capitalizeFirstLetter} from "@/lib/text";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {UserRating} from "@/app/items/_components/Rating";
import {MongoUserType} from "@/models/User";
import {MongoPaymentMethodsType} from "@/models/PaymentMethods";
import ContactSeller from "@/components/ContactSeller";

export const ListItem = ({
    item,
    isLiked,
    seller,
                             payment_methods
                         }: {
    item: any
    isLiked: boolean
    seller: MongoUserType,
    payment_methods: MongoPaymentMethodsType[]
}) => {

    return <div className="min-h-screen">
        <main className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">{item.title}</h1>
                <ListingItem item={item} isLiked={isLiked}/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="md:col-span-2 aspect-square relative rounded-lg overflow-hidden">
                            <Image src={item.images?.[0] || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                        </div>
                        {item.images?.slice(1, 5).map((image: string, index: number) => (
                            <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                                <Image
                                    src={image || "/placeholder.svg?height=300&width=300"}
                                    alt={`${item.title} detail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                                {index === 3 && item.images.length > 5 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                        <Button variant="outline" className="text-white border-white hover:text-white hover:bg-black/70">
                                            Show all photos
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {Array.from({ length: item.images?.slice(1).length }).map((_, index) => (
                            <div key={`placeholder-${index}`} className="aspect-square relative rounded-lg overflow-hidden">
                                <Image
                                    src={`/placeholder.svg?height=300&width=300`}
                                    alt={`${item.title} placeholder ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="md:sticky md:top-24 h-fit">
                    <PurchaseOptions item={item} seller={seller} pm={payment_methods} />
                </div>
            </div>
        </main>
    </div>
}