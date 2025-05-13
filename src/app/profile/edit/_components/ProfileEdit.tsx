'use client'

import {useRouter} from "next/navigation";
import {useAuth} from "@/context/auth-context";
import React, {useEffect, useState} from "react";
import {disableMfa, setMfaSecret, updateUserProfile} from "@/lib/users";
import {toast} from "@/hooks/use-toast";
import ProtectedRoute from "@/components/protected-route";
import {ArrowLeft, CreditCard, Edit, Loader2, ShieldCheck, ShieldX, Trash2, Wallet, X} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {MongoPaymentMethodsType} from "@/models/PaymentMethods";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {cn} from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {format} from "date-fns";
import {Separator} from "@radix-ui/react-menu";
import {DialogBody} from "next/dist/client/components/react-dev-overlay/ui/components/dialog";
import {Badge} from "@/components/ui/badge";
import QRCodeDialog from "@/components/qr-code-mfa";
import {OTPInput} from "input-otp";
import {InputOTPSeparator, InputOTPSlot} from "@/components/ui/input-otp";

export const ProfileEdit = ({payment_methods, oldDisplayName}: {
    payment_methods: MongoPaymentMethodsType[],
    oldDisplayName?: string
}) => {
    const router = useRouter()
    const { user, userProfile } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        displayName: "",
    })

    const [cardForm, setCardForm] = useState({
        cardNumber: "",
        cardName: "",
        expiryDate: "",
        cvv: "",
    })
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const [pm, setPM] = useState<any[]>(payment_methods)
    const [qrCodeData, setQrCodeData] = useState<{ qr: string, secret: string } | null>(null);
    const [isMFAEnabled, setisMFAEnabled] = useState<boolean>()


    useEffect(() => {
        if (userProfile) {
            setFormData({
                displayName: oldDisplayName || "",
            })
            setisMFAEnabled(userProfile?.mfaEnabled)
        }
    }, [oldDisplayName, userProfile])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCardForm((prev) => ({ ...prev, [name]: value }))
    }

    const isVisaCard = () => {
        const cardNumber = cardForm.cardNumber.replace(/\s+/g, "")
        return cardNumber.startsWith("4") && cardNumber.length === 16
    }

    const isMasterCard = () => {
        const cardNumber = cardForm.cardNumber.replace(/\s+/g, "")
        return cardNumber.startsWith("5") && cardNumber.length === 16
    }

    const isAmexCard = () => {
        const cardNumber = cardForm.cardNumber.replace(/\s+/g, "")
        return cardNumber.startsWith("3") && (cardNumber.length === 15 || cardNumber.length === 16)
    }

    const validateCardInfo = () => {
        const cardNumber = cardForm.cardNumber.replace(/\s+/g, "")
        const expiryDate = cardForm.expiryDate.split("/").map(Number)
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth() + 1
        const currentYear = currentDate.getFullYear() % 100

        if (cardNumber.length < 16 || !/^\d+$/.test(cardNumber)) {
            return false
        }

        if (expiryDate[0] < currentMonth || (expiryDate[0] === currentMonth && expiryDate[1] < currentYear)) {
            return false
        }

        if (cardForm.cvv.length < 3 || !/^\d+$/.test(cardForm.cvv)) {
            return false
        }

        return true
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setIsLoading(true)

        try {

            // Update user profile
            await updateUserProfile(user.uid, {
                ...formData,
                updatedAt: new Date(),
            })

            toast({
                title: "Profile updated",
                description: "Your profile has been successfully updated",
            })

            router.push("/profile")
        } catch (error) {
            console.error("Error updating profile:", error)
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddCard = async () => {
        fetch('/api/payment-methods', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${await user?.getIdToken()}`
            },
            body: JSON.stringify({data: {
                userId: user?.uid,
                cardNumber: cardForm.cardNumber.replace(/\s+/g, ""),
                billingName: cardForm.cardName,
                expirationDate: cardForm.expiryDate,
                cvv: cardForm.cvv,
            }}),
        }).then(res => {
            if (res.ok) {
                toast({
                    title: "Payment method added",
                    description: "Your payment method has been successfully added",
                })
                setPM(prev=>{
                    return [
                        ...prev,
                        {
                            cardNumber: cardForm.cardNumber.replace(/\s+/g, ""),
                            billingName: cardForm.cardName,
                            expirationDate: cardForm.expiryDate,
                            cvv: cardForm.cvv,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            _id: new Date().toString(),
                        }
                    ]
                })
                setCardForm({
                    cardNumber: "",
                    cardName: "",
                    expiryDate: "",
                    cvv: "",
                })
                setIsDialogOpen(false)
            } else {
                toast({
                    title: "Error",
                    description: "Failed to add payment method. Please try again.",
                    variant: "destructive",
                })
            }
        }).catch(err => {
            console.error("Error adding payment method:", err)
            toast({
                title: "Error",
                description: "Failed to add payment method. Please try again.",
                variant: "destructive",
            })
        })
    }

    const getCardIcon = (cardType: string) => {
        switch (cardType) {
            case "visa":
                return <div className="text-blue-600 font-bold italic text-sm">VISA</div>
            case "mastercard":
                return (
                    <div className="flex">
                        <div className="w-4 h-4 bg-red-500 rounded-full opacity-80 -mr-1.5"></div>
                        <div className="w-4 h-4 bg-yellow-400 rounded-full opacity-80"></div>
                    </div>
                )
            case "amex":
                return <div className="text-green-600 font-bold text-xs">AMEX</div>
            case "discover":
                return <div className="text-orange-500 font-bold text-xs">DISCOVER</div>
            default:
                return <CreditCard className="h-4 w-4" />
        }
    }

    const handleToggleMfa = async () => {
        setIsLoading(true);
        try {
            if (isMFAEnabled) {
                await disableMfa(userProfile?.uid!);
                toast({ title: "MFA Disabled" });
                setisMFAEnabled(false)
            } else {
                const jwt = await user?.getIdToken();
                const response = await fetch('/api/mfa/setup', {
                    method: "POST",
                    body: JSON.stringify({ uid: user?.uid! }),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${jwt}`
                    }
                });
                const { qr, secret } = await response.json();
                setQrCodeData({ qr, secret });
            }
        } catch (err) {
            console.error('Failed to update MFA:', err);
            toast({ title: "Error", description: "Could not update MFA.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            {qrCodeData && (
                <QRCodeDialog
                    qrCode={qrCodeData.qr}
                    secret={qrCodeData.secret}
                    uid={user?.uid!}
                    onVerified={() => {
                        setQrCodeData(null);
                        setisMFAEnabled(true)
                        toast({ title: "MFA Enabled" });
                    }}
                />
            )}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center mb-6">
                        <button onClick={() => router.back()} className="mr-4 bg-gray-100 rounded-full p-2">
                            <ArrowLeft className={'w-4 h-4'}/>
                        </button>
                        <h1 className="text-2xl font-bold">Edit Profile</h1>
                    </div>
                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="profile">Profile Information</TabsTrigger>
                            <TabsTrigger value="payment_info">Payment Methods</TabsTrigger>
                        </TabsList>
                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>Update your personal information and profile picture</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                                        <div className="relative">
                                            <Avatar className="h-24 w-24">
                                                <AvatarFallback className="text-2xl">
                                                    {formData.displayName ? formData.displayName.charAt(0).toUpperCase() : "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <form onSubmit={handleSubmit} className={'flex gap-2'}>
                                            <div className=" space-y-4">
                                                <div>
                                                    <Label htmlFor="displayName">Display Name</Label>
                                                    <Input
                                                        id="displayName"
                                                        name="displayName"
                                                        value={formData.displayName}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-6 flex justify-end gap-4">
                                                <Button type="submit" disabled={isLoading}>
                                                    {isLoading ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        "Save Changes"
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="mt-2">
                                <CardHeader className="flex flex-row items-start justify-between">
                                    <div>
                                        <CardTitle>Multi-Factor Authentication</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Enhance your account security with a TOTP-based second factor.
                                        </p>
                                    </div>
                                    <Badge variant={isMFAEnabled ? 'outline' : 'secondary'}>
                                        {isMFAEnabled ? (
                                            <>
                                                <ShieldCheck className="mr-1 h-4 w-4" />
                                                Enabled
                                            </>
                                        ) : (
                                            <>
                                                <ShieldX className="mr-1 h-4 w-4" />
                                                Disabled
                                            </>
                                        )}
                                    </Badge>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    <Button
                                        variant={isMFAEnabled ? 'destructive' : 'secondary'}
                                        onClick={handleToggleMfa}
                                    >
                                        {isMFAEnabled ? 'Disable MFA' : 'Enable MFA'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value={'payment_info'}>
                            {
                                pm.length > 0 ? (
                                    <div className="space-y-4">
                                        {pm.map((method) => (
                                            <div
                                                key={method._id}
                                                className={cn(
                                                    "flex items-center justify-between rounded-lg border p-4",
                                                )}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-10 w-14 flex items-center justify-center rounded bg-gray-100">
                                                            {getCardIcon(method.cardNumber.startsWith("4") ? "visa" : method.cardNumber.startsWith("5") ? "mastercard" : method.cardNumber.startsWith("3") ? "amex" : "other")}
                                                        </div>
                                                        <div>
                                                            <Label htmlFor={method.id} className="text-base font-medium flex items-center">
                                                                •••• {method.cardNumber.slice(method.cardNumber.length - 5, method.cardNumber.length - 1)}
                                                            </Label>
                                                            <div className="text-sm text-muted-foreground">Expires {method.expirationDate}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <Trash2 className="h-4 w-4" />
                                                                <span className="sr-only">Delete</span>
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete payment method</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this payment method? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={async () => {
                                                                    await fetch('/api/payment-methods', {
                                                                        method: 'DELETE',
                                                                        headers: {
                                                                            'Content-Type': 'application/json',
                                                                            "Authorization": `Bearer ${await user?.getIdToken()}`
                                                                        },
                                                                        body: JSON.stringify({ payment_method_id: method._id }),
                                                                    }).then(res=>{
                                                                        if(res.ok){
                                                                            toast({
                                                                                title: "Payment method deleted",
                                                                                description: "Your payment method has been successfully deleted",
                                                                            })
                                                                            setPM(pm.filter((item) => item._id !== method._id))
                                                                        }
                                                                    }).catch(err=>{
                                                                        console.error("Error deleting payment method:", err)
                                                                        toast({
                                                                            title: "Error",
                                                                            description: "Failed to delete payment method. Please try again.",
                                                                            variant: "destructive",
                                                                        })
                                                                    })
                                                                }}>Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-gray-500">No payment methods found.</p>
                                    </div>
                                )
                            }
                            <Button onClick={()=>{
                                setIsDialogOpen(true)
                            }}
                                className={'mx-auto mt-4 flex items-center justify-center'}
                            >
                                <CreditCard className="mr-2 h-4 w-4" />
                                Add Payment Method
                            </Button>
                            <div>
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Add a payment method</DialogTitle>
                                        </DialogHeader>
                                        <DialogBody>
                                                    <div className="py-4 flex flex-col gap-2">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="cardNumber">Card Number</Label>
                                                                <Input
                                                                    id="cardNumber"
                                                                    name="cardNumber"
                                                                    placeholder="1234 5678 9012 3456"
                                                                    value={cardForm.cardNumber}
                                                                    onChange={handleCardInputChange}
                                                                    maxLength={19}
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="cardName">Cardholder Name</Label>
                                                                <Input
                                                                    id="cardName"
                                                                    name="cardName"
                                                                    placeholder="John Doe"
                                                                    value={cardForm.cardName}
                                                                    onChange={handleCardInputChange}
                                                                />
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="expiryDate">Expiry Date</Label>
                                                                    <Input
                                                                        id="expiryDate"
                                                                        name="expiryDate"
                                                                        placeholder="MM/YY"
                                                                        value={cardForm.expiryDate}
                                                                        onChange={handleCardInputChange}
                                                                        maxLength={5}
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="cvv">CVV</Label>
                                                                    <Input
                                                                        id="cvv"
                                                                        name="cvv"
                                                                        placeholder="123"
                                                                        value={cardForm.cvv}
                                                                        onChange={handleCardInputChange}
                                                                        maxLength={4}
                                                                        type="password"
                                                                    />
                                                                </div>
                                                            </div>


                                                    <p className="text-xs text-muted-foreground">
                                                        Your card information is encrypted and secure. We do not store your full card details.
                                                    </p>
                                        </div>
                                        </DialogBody>
                                        <DialogFooter className="flex flex-col sm:flex-row gap-2">
                                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleAddCard}
                                                disabled={!validateCardInfo()}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    "Save Card"
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </TabsContent>

                    </Tabs>



                </div>
            </div>
        </ProtectedRoute>
    )
}