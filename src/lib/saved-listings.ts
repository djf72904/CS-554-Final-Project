import {getListing} from "@/lib/listings";

export const convertListingsToObj = async (listingList: any) => {
    let listingObjs = []
    listingList = JSON.parse(listingList)

    if(listingList === null){
        return listingList
    }

    for(let i=0; i<listingList.length; i++){
        const currListing = await getListing(listingList[i]);

        if(!currListing){
            throw new Error(`listing with id: ${listingList[i]} at index ${i} of likedListings not found`)
        }
        if(currListing.status === "active"){
            listingObjs.push(await getListing(listingList[i]))
        }
    }

    return JSON.stringify(listingObjs)

}