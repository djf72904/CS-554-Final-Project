'use client'

import {Button} from "@/components/ui/button";
import {Heart} from "lucide-react";
import {useAuth} from "@/context/auth-context";
import {useState} from "react";

export const ListingItem = ({item, isLiked, jwt}: {
    item: any,
    isLiked: boolean,
    jwt: string
}) => {
    const {user} = useAuth()

    const [isSaved, setIsSaved] = useState(isLiked ?? false)

    //TODO
    const handleLikeUnlike = () => {
        const staticIsSaved = isSaved;
        setIsSaved((prevState) => !prevState)

        async function updateProfileLike(){
            const getResponse = await fetch("/api/users/profile", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`
                }
            });
            const fullUserInfo = JSON.parse(await getResponse.json())
            if(staticIsSaved){
                const removed = fullUserInfo.user.likedPosts.indexOf(item._id)
                fullUserInfo.user.likedPosts.splice(removed, 1)
            }
            else{
                fullUserInfo.user.likedPosts.push(item._id)
            }
            const patchResponse = await fetch("/api/users/profile", {
                method: "PATCH",
                body: JSON.stringify(fullUserInfo.user),
                headers:{
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`
                }
            });
            return await patchResponse.json()
        }

        async function updateListingLike(){
            if(staticIsSaved){
                const removed = item.likes.indexOf(user?.uid)
                item.likes.splice(removed, 1)
            }
            else{
                item.likes.push(user?.uid)
            }
            const patchResponse = await fetch(`/api/listings/${item._id.toString()}`, {
                method: "PATCH",
                body: JSON.stringify(item),
                headers:{
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`
                }
            });
            return await patchResponse.json()
        }
        updateProfileLike()
        updateListingLike()
    }


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