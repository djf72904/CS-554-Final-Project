'use client'

import {Button} from "@/components/ui/button";
import {Heart} from "lucide-react";
import {useAuth} from "@/context/auth-context";
import {useState} from "react";

export const ListingItem = ({item, isLiked}: {
    item: any,
    isLiked: boolean
}) => {
    const {user} = useAuth()

    const [isSaved, setIsSaved] = useState(isLiked ?? false)

    //TODO
    const handleLikeUnlike = () => {}


    const getSavedColor = () => {
        if (isSaved) {
            return 'red'
        }
    }

    return <Button variant="ghost" size="sm" className={`flex items-center gap-2`} onClick={handleLikeUnlike}>
        <Heart fill={getSavedColor()} className={"h-4 w-4"} />
        <span>{
            isSaved ? 'Saved' : 'Save'
        }</span>
    </Button>
}