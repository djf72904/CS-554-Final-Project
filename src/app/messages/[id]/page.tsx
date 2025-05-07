import React from "react";
import {MessageDetails} from "@/app/messages/[id]/_components/MessageDetails";

export default async function MessagingPage ({params}: {
    params: {
        id: string
    }
}) {

    const message_id = (await params).id

    return <MessageDetails/>
}