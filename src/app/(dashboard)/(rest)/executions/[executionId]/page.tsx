import { requireAuth } from "@/lib/auth-utils";


interface PageProps {
    params: Promise<{
        executionId: string
    }>
}

const page = async({params}: PageProps) => {
    await requireAuth()
    const {executionId} = await params;
  return (
    <div>execution id: {executionId}</div>
  )
}

export default page