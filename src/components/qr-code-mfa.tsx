'use client'

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import React, {useEffect, useState} from 'react'
import {OTPInput} from "input-otp";
import {InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot} from "@/components/ui/input-otp";

interface QRCodeDialogProps {
    qrCode: string
    secret: string
    uid: string
    onVerified?: () => void
}

export default function QRCodeDialog({ qrCode, secret, uid, onVerified }: Readonly<QRCodeDialogProps>) {
    const [open, setOpen] = useState(false)
    const [code, setCode] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const { toast } = useToast()

    const handleVerify = async () => {
        setIsVerifying(true)

        try {
            const res = await fetch('/api/mfa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, token: code }),
            })

            const status = (await res.json()).success



            if (status) {
                toast({ title: 'MFA Verified', description: 'Two-factor authentication is now enabled.' })
                setOpen(false)
                onVerified?.()
            } else {
                toast({ title: 'Invalid Code', description: 'Please try again.', variant: 'destructive' })
            }
        } catch (e) {
            toast({ title: 'Error verifying code', variant: 'destructive' })
        } finally {
            setIsVerifying(false)
        }
    }

    useEffect(() => {
        if(qrCode && secret){
            setOpen(true)
        }
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Set Up MFA</DialogTitle>
                    <DialogDescription>
                        Scan the QR code with Google Authenticator or similar app, then enter the code.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-4">
                    <Image
                        src={qrCode}
                        alt="MFA QR Code"
                        width={200}
                        height={200}
                        className="rounded border"
                    />
                    <p className="text-sm text-muted-foreground text-center">
                        Can’t scan? Use this secret: <br />
                        <span className="font-mono text-primary">{secret}</span>
                    </p>

                    <div className="w-full">
                        <Label htmlFor="code" className="mb-2 block">
                            Enter 6-digit code
                        </Label>
                        <div className={'w-full flex justify-center'}>
                            <InputOTP  maxLength={6} onChange={setCode} value={code}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0}/>
                                    <InputOTPSlot index={1}/>
                                    <InputOTPSlot index={2}/>
                                </InputOTPGroup>
                                <InputOTPSeparator/>
                                <InputOTPGroup>
                                    <InputOTPSlot index={3}/>
                                    <InputOTPSlot index={4}/>
                                    <InputOTPSlot index={5}/>
                                </InputOTPGroup>

                            </InputOTP>
                        </div>
                    </div>

                    <Button
                        disabled={isVerifying || code.length !== 6}
                        onClick={handleVerify}
                        className="w-full"
                    >
                        {isVerifying ? 'Verifying...' : 'Verify & Enable'}
                    </Button>

                    <DialogClose asChild>
                        <Button onClick={()=> {
                            setOpen(false)
                        }} variant="ghost" className="w-full mt-1 text-muted-foreground">
                            Cancel
                        </Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    )
}