'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { useToast } from '@/components/ui/use-toast'
import { useState } from 'react'
import {useAuth} from "@/context/auth-context";

export default function MfaPromptDialog({
                                            open,
                                            onClose,
                                            uid,
                                            onSuccess,
                                        }: Readonly<{
    open: boolean
    onClose: any
    uid: string
    onSuccess: any
}>) {
    const [code, setCode] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const { toast } = useToast()
    const {pendingMfaUser} = useAuth()

    const handleVerify = async () => {

        setIsVerifying(true)
        try {

            const res = await fetch('/api/mfa/verify-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',  Authorization: `Bearer ${await pendingMfaUser?.getIdToken()}`, },
                body: JSON.stringify({ uid: pendingMfaUser?.uid, token: code }),
            })

            if ((await res.json()).success) {

                toast({ title: 'MFA Verified', description: 'Welcome back!' })
                onSuccess()
            } else {
                toast({ title: 'Invalid Code', description: 'Try again.', variant: 'destructive' })
            }
        } catch (e) {
            toast({ title: 'Verification error', variant: 'destructive' })
        } finally {
            setIsVerifying(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Multi-Factor Authentication</DialogTitle>
                    <DialogDescription>
                        Enter your 6-digit authentication code to complete sign in.
                    </DialogDescription>
                </DialogHeader>

                <div className="w-full flex justify-center mb-4">
                    <InputOTP value={code} onChange={setCode} maxLength={6}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleVerify}
                        disabled={code.length !== 6 || isVerifying}
                        className="w-full"
                    >
                        {isVerifying ? 'Verifying...' : 'Verify'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}