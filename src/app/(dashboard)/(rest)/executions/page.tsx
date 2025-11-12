import { requireAuth } from "@/lib/auth-utils"


const page = async() => {
    await requireAuth()
  return (
    <div>executions</div>
  )
}

export default page