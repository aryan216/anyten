import { requireAuth } from "@/lib/auth-utils"

const page = async() => {
    await requireAuth()
  return (
    <div>credentials</div>
  )
}

export default page