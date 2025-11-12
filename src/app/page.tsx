"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { requireAuth } from "@/lib/auth-utils"
import { caller } from "@/trpc/server"
import { createAuthClient } from "better-auth/react"
import { LogoutButton } from "./logout"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
const page =  () => {
  
  const trpc=useTRPC();
  const queryClient=useQueryClient();
  const {data} =  useQuery(trpc.getWorkflows.queryOptions());

  const create =useMutation(trpc.createWorkflow.mutationOptions({
    onSuccess:()=>{
      // queryClient.invalidateQueries(trpc.getWorkflows.queryOptions());
      toast.success("Job Queued")
    }
  }));
  
  return (
    <div className='flex min-h-screen min-w-screen items-center justify-center flex-col gap-y-6'>
      Protected server component
      {JSON.stringify(data,null,2)}

      <div>
        <div>
          <Button disabled={create.isPending} onClick={()=>create.mutate()}>
            Create Wokflow
          </Button>
        </div>
        <LogoutButton/>
      </div>
    </div>
    
  )
}

export default page