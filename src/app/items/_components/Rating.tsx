'use client'

import {useAuth} from "@/context/auth-context";
import {Star} from "lucide-react";

export const UserRating = ({seller}: Readonly<{ seller: any }>) => {

    return <div className={'flex space-x-2 items-center'}>
        <span className="ml-1 font-medium">{
            seller?.rating ? seller.rating.toFixed(1) : "N/A"
        }</span>
        {
            Array.from({length: Math.floor(seller?.rating ?? 0)}).map((_, i) => (
                <svg key={'star:' + i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4 text-yellow-500"
                >
                    <path
                        fillRule="evenodd"
                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                        clipRule="evenodd"
                    />
                </svg>
            ))
        }
    </div>

}