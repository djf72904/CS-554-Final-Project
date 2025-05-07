import {format} from "date-fns";
import {Check} from "lucide-react";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";

export const ToChatBubble = ({msg, time, sender}: {
    msg: string, time: Date, sender: {
        displayName: string
    }
}) => {
    return <div key={msg} className={("flex gap-3")}>
        <div className="flex-shrink-0">
            <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarFallback>{sender.displayName.split(" ").map(i => {
                    return i[0]
                })}</AvatarFallback>
            </Avatar>
        </div>

        <div className={"flex flex-col max-w-[80%]"}>
            <div className="flex items-center mb-1">
                <span className="font-semibold text-sm">{sender.displayName}</span>
                <span className="text-gray-400 text-xs ml-2">{format(time, 'MMMM d, H:MM')}</span>
            </div>

            <div
                className={"rounded-lg p-3 bg-gray-100 rounded-tl-none"}
            >
                <p>{msg}</p>
            </div>
        </div>
    </div>
}
export const FromChatBubble = ({msg, time}: { msg: string, time: Date }) => {
    return <div key={msg} className={("flex gap-3 flex-row-reverse")}>
        <div className={("flex flex-col max-w-[80%] items-end")}>

            <div
                className={"rounded-lg p-3 bg-red-500 text-white rounded-tr-none"}
            >
                <p>{msg}</p>
            </div>
            <div className="flex items-center mt-1">
                <span className="text-gray-400 text-xs mr-1">{format(time, 'MMMM d, H:MM')}</span>
                <Check className="h-3 w-3 text-emerald-500"/>
            </div>
        </div>
    </div>
}