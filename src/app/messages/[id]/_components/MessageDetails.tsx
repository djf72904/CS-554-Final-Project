'use client'

import {ArrowLeft} from "lucide-react";
import {FromChatBubble, ToChatBubble} from "@/app/messages/[id]/_components/bubbles";
import MessageInput from "@/app/messages/[id]/_components/input";
import React from "react";
import {useRouter} from "next/navigation";

export const MessageDetails = () => {

    const router = useRouter()

    return <div className={'h-[90vh] overflow-y-scroll flex flex-col justify-between'}>
        <div>
            <div className="flex items-center mb-6">
                <button onClick={() => router.back()} className="mr-4 bg-gray-100 rounded-full p-2">
                    <ArrowLeft className={'w-4 h-4'}/>
                </button>
                <h1 className="text-2xl font-bold">Messages with [NAME]</h1>
            </div>
        </div>
        <ToChatBubble msg={'This is a test'} time={new Date()} sender={{
            displayName: "Jack Patterson"
        }}/>
        <FromChatBubble msg={'This is a test'} time={new Date()}/>
        <div className={'!-mt-[74px]'}>
            <MessageInput/>
        </div>
    </div>
}