"use client"

import {useState, useEffect, useRef} from "react"
import { formatDistanceToNow } from "date-fns"
import { format } from "date-fns"
import { Send, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {useAuth} from "@/context/auth-context";
import {getMessagesForUser} from "@/lib/messages";
import {User as FBUser} from '@firebase/auth'
import {useRouter} from "next/navigation";

// Updated user interface
interface User {
    uid: string
    displayName: string
}

// Updated message interface with new user structure
interface Message {
    read: boolean;
    text: string
    senderId: User
    receiverId: User
    createdAt: string
    updatedAt: string
}

interface Conversation {
    id: string
    participant: User
    lastMessage: string
    lastMessageDate: string
    unreadCount: number
}


const ToChatBubble = ({
                          msg,
                          time,
                          sender,
                      }: {
    msg: string
    time: Date
    sender: {
        displayName: string
    }
}) => {
    return (
        <div key={msg} className={"flex gap-3"}>
            <div className="flex-shrink-0">
                <Avatar className="h-10 w-10 border-2 border-white">
                    <AvatarFallback>
                        {sender.displayName.split(" ").map((i) => {
                            return i[0]
                        })}
                    </AvatarFallback>
                </Avatar>
            </div>

            <div className={"flex flex-col max-w-[80%]"}>
                <div className="flex items-center mb-1">
                    <span className="font-semibold text-sm">{sender.displayName}</span>
                    <span className="text-gray-400 text-xs ml-2">{format(time, "MMMM d, h:mm")}</span>
                </div>

                <div className={"rounded-lg p-3 bg-gray-100 rounded-tl-none"}>
                    <p>{msg}</p>
                </div>
            </div>
        </div>
    )
}

const FromChatBubble = ({ msg, time }: { msg: string; time: Date }) => {
    return (
        <div key={msg} className={"flex gap-3 flex-row-reverse"}>
            <div className={"flex flex-col max-w-[80%] items-end"}>
                <div className={"rounded-lg p-3 bg-red-500 text-white rounded-tr-none"}>
                    <p>{msg}</p>
                </div>
                <div className="flex items-center mt-1">
                    <span className="text-gray-400 text-xs mr-1">{format(time, "MMMM d, h:mm")}</span>
                    <Check className="h-3 w-3 text-emerald-500" />
                </div>
            </div>
        </div>
    )
}

const sendMessageToQueue = async (user: FBUser, receiverId: string, msg: string) => await fetch("/api/messages/send", {

    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await user.getIdToken()}`,
    },
    body: JSON.stringify({
        from: user.uid,
        to: receiverId,
        text: msg
    }),
})

export default function MessagingPage() {
    const { user, loading } = useAuth() // Get the authenticated user
    if (!user) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Redirecting to login...</p>
                </div>
            </div>
        )
    }
    const [load2, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
    const [conversations, setConversations] = useState<Conversation[]>([])
    const readConversations = useRef<Set<string>>(new Set())

    const wsRef = useRef<WebSocket | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login")
        }
    }, [user, loading, router])

    useEffect(() => {
        if (!user) return

        async function connectWebSocket() {
            try {
                const token = await user?.getIdToken()

                if (wsRef.current) {
                    wsRef.current.close()
                }

                const ws = new WebSocket(
                    `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.hostname}4000?token=${token}`,
                )

                ws.onopen = () => {
                    console.log("WebSocket connected")
                }

                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data)

                    if (data.type === "new_message") {
                        setMessages((prevMessages) => {
                            const messageExists = prevMessages.some(
                                (msg) => msg.senderId.uid === data.message.senderId.uid && msg.createdAt === data.message.createdAt,
                            )

                            if (messageExists) return prevMessages
                            return [...prevMessages, data.message]
                        })
                    }
                }

                ws.onerror = (error) => {
                    //console.error("WebSocket error:", error)
                }

                ws.onclose = () => {
                    console.log("WebSocket disconnected")
                    setTimeout(connectWebSocket, 5000)
                }

                wsRef.current = ws
            } catch (error) {
                console.error("Error connecting to WebSocket:", error)
            }
        }
        try {
            connectWebSocket()
        }catch(error){
            console.error("Could not connect to WebSocket:", error)
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.close()
            }
        }
    }, [user])

    const messagesEndRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])


    useEffect(() => {
        async function fetchMessages() {
            if (!user?.uid) return

            try {
                setLoading(true)
                const fetchedMessages = JSON.parse(await getMessagesForUser(user.uid))
                //@ts-ignore
                console.log({fetchedMessages})

                setMessages(fetchedMessages)
                setError(null)
            } catch (err) {
                console.error("Error fetching messages:", err)
                setError("Failed to load messages. Please try again.")
            } finally {
                setLoading(false)
            }
        }


        fetchMessages()
    }, [user])

    useEffect(() => {
        if (!user?.uid) return

        const conversationMap = new Map<string, Conversation>()

        messages.forEach((message) => {
            const isIncoming = message.receiverId.uid === user.uid
            const participant = isIncoming ? message.senderId : message.receiverId
            const conversationId = [user.uid, participant.uid].sort().join("-")

            if (!conversationMap.has(conversationId)) {
                conversationMap.set(conversationId, {
                    id: conversationId,
                    participant,
                    lastMessage: message.text,
                    lastMessageDate: message.createdAt,
                    unreadCount: isIncoming && !message.read ? 1 : 0,
                })
            } else {
                const existing = conversationMap.get(conversationId)!
                if (new Date(message.createdAt) > new Date(existing.lastMessageDate)) {
                    existing.lastMessage = message.text
                    existing.lastMessageDate = message.createdAt
                    if (isIncoming && message.read) {
                        existing.unreadCount += 1
                    }
                }
            }
        })

        const sortedConversations = Array.from(conversationMap.values()).sort(
            (a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime(),
        )

        setConversations(sortedConversations)

        if (sortedConversations.length > 0 && !selectedConversation) {
            setSelectedConversation(sortedConversations[0].id)
        }
    }, [messages, user, selectedConversation])

    const conversationMessages = selectedConversation
        ? messages
            .filter((message) => {
                const participants = [message.senderId.uid, message.receiverId.uid].sort().join("-")
                return participants === selectedConversation
            })
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        : []

    const selectedParticipant = selectedConversation
        ? conversations.find((c) => c.id === selectedConversation)?.participant
        : null

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || !selectedParticipant || !user?.uid) return


        try{
            const response = await sendMessageToQueue(user, selectedParticipant.uid, newMessage)
            console.log(await response.json())
        }
        catch(err){
            throw new Error(`Error sending message: ${err}`)
        }



        const newMsg: Message = {
            text: newMessage,
            senderId: { uid: user.uid, displayName: user.displayName || "You" },
            receiverId: selectedParticipant,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            read: false
        }

        setMessages([...messages, newMsg])
        setNewMessage("")
    }

    const getUserInitials = (displayName: string) => {
        return displayName
            .split(" ")
            .map((name) => name[0])
            .join("")
            .toUpperCase()
    }

    return (
        <div className="flex h-[calc(100vh-76px)] bg-background relative">
            {load2 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
                    <div className="text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                        <p className="mt-2 text-sm text-muted-foreground">Loading messages...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
                    <div className="bg-destructive/10 border border-destructive p-4 rounded-md">
                        <p className="text-destructive">{error}</p>
                        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                            Retry
                        </Button>
                    </div>
                </div>
            )}

            <div className="w-1/3 border-r border-border overflow-y-auto">
                <div className="p-4 border-b border-border">
                    <h1 className="text-xl font-bold">Messages</h1>
                </div>

                <div className="divide-y divide-border">
                    {conversations.map((conversation) => (
                        <div
                            key={conversation.id}
                            className={`p-4 cursor-pointer hover:bg-muted/50 ${
                                selectedConversation === conversation.id ? "bg-muted" : ""
                            }`}
                            onClick={async () => {
                                setSelectedConversation(conversation.id)

                                // Clear unread count
                                setConversations((prev) =>
                                    prev.map((conv) =>
                                        conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
                                    )
                                )

                                readConversations.current.add(conversation.id)

                                try {
                                    if(user) {
                                        await fetch(`/api/messages/mark-read`, {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                                Authorization: `Bearer ${await user.getIdToken()}`,
                                            },
                                            body: JSON.stringify({participantId: conversation.participant.uid}),
                                        })
                                    }
                                } catch (err) {
                                    console.error("Failed to mark messages as read:", err)
                                }

                            }}

                        >
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback>{getUserInitials(conversation.participant.displayName)}</AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <p className="font-medium truncate">{conversation.participant.displayName}</p>
                                        <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conversation.lastMessageDate), { addSuffix: true })}
                    </span>
                                    </div>

                                    <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                                </div>

                                {conversation.unreadCount > 0 && (
                                    <div className="flex-shrink-0 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                                        <span className="text-xs text-primary-foreground">{conversation.unreadCount}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {conversations.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">No conversations yet</div>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                {selectedConversation && selectedParticipant ? (
                    <>
                        <div className="p-4 border-b border-border flex items-center space-x-4">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>{getUserInitials(selectedParticipant.displayName)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="font-medium">{selectedParticipant.displayName}</h2>
                                <p className="text-xs text-muted-foreground">
                                    {conversations.find((c) => c.id === selectedConversation)?.lastMessageDate
                                        ? `Conversation Last active ${formatDistanceToNow(
                                            new Date(conversations.find((c) => c.id === selectedConversation)!.lastMessageDate),
                                            { addSuffix: true },
                                        )}`
                                        : "No recent activity"}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {conversationMessages.map((message, index) => {
                                const messageTime = new Date(message.createdAt)

                                return message.senderId.uid === user?.uid ? (
                                    <FromChatBubble key={index} msg={message.text} time={messageTime} />
                                ) : (
                                    <ToChatBubble key={index} msg={message.text} time={messageTime} sender={message.senderId} />
                                )
                            })}

                            {conversationMessages.length === 0 && (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-muted-foreground">No messages yet</p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-border">
                            <div className="flex space-x-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSendMessage()
                                        }
                                    }}
                                />
                                <Button onClick={handleSendMessage} size="icon">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-xl font-medium mb-2">Select a conversation</h2>
                            <p className="text-muted-foreground">Choose a conversation from the list to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
