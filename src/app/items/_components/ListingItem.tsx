'use client'

import {Button} from "@/components/ui/button";
import {Heart} from "lucide-react";
import {useAuth} from "@/context/auth-context";
import {useState} from "react";
import NumberFlow from "@number-flow/react";

export const ListingItem = ({item, isLiked, jwt}: {
    item: any,
    isLiked: boolean,
    jwt: string
}) => {
    const {user} = useAuth()

    const [isSaved, setIsSaved] = useState(isLiked ?? false)

    const [likes, setLikes] = useState<number>(item.likes?.length ?? 0)

    const handleLikeUnlike = () => {
        if(user?.uid === item.userId){
            alert("Cannot like own listing")
            return
        }
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
            const fullUserInfo = JSON.parse((await getResponse.json()).user)
            if(staticIsSaved){
                const removed = fullUserInfo.likedPosts.indexOf(item._id)
                fullUserInfo.likedPosts.splice(removed, 1)
            }
            else{
                fullUserInfo.likedPosts.push(item._id)
            }
            const patchResponse = await fetch("/api/users/profile", {
                method: "PATCH",
                body: JSON.stringify(fullUserInfo),
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

        if(isSaved){
            setLikes(prev=>prev-1)
        }
        else{
            setLikes(prev=>prev+1)
        }

    }


    const getSavedColor = () => {
        if (isSaved && user !== null) {
            return 'red'
        }
    }

    return  <div className="flex items-center gap-4">
        <NumberFlow value={likes}/>
        <Button variant="ghost" size="sm" className={`flex items-center gap-2 bg-gray-100 hover:bg-gray-200`} onClick={handleLikeUnlike} disabled={user === null}>
        <Heart fill={getSavedColor()} className={"h-4 w-4"} />
        <span>{
            (isSaved && user !== null) ? 'Saved' : 'Save'
        }</span>
    </Button>
    </div>
}