import AuthLayout from "@/features/auth/components/auth-layout"
import Image from "next/image"
import Link from "next/link"
import { ReactNode } from "react"

const Layout = ({children}:{children:ReactNode}) =>{
    return (
         <AuthLayout>

             {children}
         </AuthLayout>

        
    )
}

export default Layout