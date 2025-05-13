import {Login} from "@/app/login/_components/Login";
import {getCurrentUser} from "@/lib/auth";
import {redirect} from "next/navigation";

export default async function LoginPage() {

  const user = await getCurrentUser()

  if(user){
    redirect('/profile')
  }

  return <Login/>
}

