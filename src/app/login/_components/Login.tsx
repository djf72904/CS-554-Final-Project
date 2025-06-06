'use client'

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {ShoppingCart} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/context/auth-context";
import {useRouter} from "next/navigation";
import {useEffect} from "react";
import MfaPromptDialog from "@/components/mfa-verify";
import {setCookie} from "cookies-next";
import searchColleges from "@/lib/college";
import {getUserProfile} from "@/lib/users";

export const Login = () => {

    const { user, loading, signInWithGoogle, needsMfa, pendingMfaUser, setUser, setUserProfile, setNeedsMfa, setPendingMfaUser, setSchool} = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && user) {
            router.push("/profile")
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading</p>
            </div>
        )
    }


    return (<div className=" flex items-center justify-center min-h-[calc(100vh-80px)] w-full">
        <MfaPromptDialog open={needsMfa} onClose={()=>{}} uid={user?.uid!}  onSuccess={async () => {
            const token = await pendingMfaUser!.getIdToken(true)
            setCookie('auth-token', token, {
                maxAge: 60 * 60,
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            })
            setCookie('auth-token-mfa', "true", {
                maxAge: 60 * 60,
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            })


            const profile = await getUserProfile(pendingMfaUser!.uid)
            const domain = pendingMfaUser!.email?.split('@')[1] || ''
            const colleges = await searchColleges.byDomain(domain)

            setSchool(colleges?.[0]?.name || '')
            setUser(pendingMfaUser)
            setUserProfile(profile)
            setNeedsMfa(false)
            setPendingMfaUser(null)
        }}/>
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className={'bg-rose-500 text-white p-2 w-fit rounded-md flex justify-center self-center align-super mb-2'}>
                    <ShoppingCart size={24} />
                </div>
                <CardTitle className="text-2xl">Welcome to Campus Bazaar</CardTitle>
                <CardDescription>Sign in with your school email to access the student marketplace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center gap-2"
                    variant="outline"
                >
                    <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                            <path
                                fill="#4285F4"
                                d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                            />
                            <path
                                fill="#34A853"
                                d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                            />
                            <path
                                fill="#EA4335"
                                d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                            />
                        </g>
                    </svg>
                    Sign in with Google
                </Button>
            </CardContent>

        </Card>
    </div>)
}