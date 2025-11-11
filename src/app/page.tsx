

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { requireAuth } from "@/lib/auth-utils"
import { caller } from "@/trpc/server"
import { createAuthClient } from "better-auth/react"
import { LogoutButton } from "./logout"
const page = async () => {
  
  await requireAuth()
  const data = await caller.getUsers();
  
  return (
    <div className='flex min-h-screen min-w-screen items-center justify-center'>
      Protected server component
      {JSON.stringify(data)}

      <div>
        <LogoutButton/>
      </div>
    </div>
    
  )
}

export default page