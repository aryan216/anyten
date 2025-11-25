import { CredentialsContainer, CredentialsError, CredentialsList, CredentialsLoading } from "@/features/credentials/components/credentials"
import { CredentialsParamsLoader } from "@/features/credentials/server/params-loader"
import { prefetchCredentials } from "@/features/credentials/server/prefetch"
import { requireAuth } from "@/lib/auth-utils"
import { HydrateClient, prefetch } from "@/trpc/server"
import {SearchParams} from "nuqs"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

type Props = {
    searchParams:SearchParams
}

const page = async({searchParams}: Props) => {
    await requireAuth()

    const params= await CredentialsParamsLoader(searchParams);
    prefetchCredentials(params);
  return (

    <CredentialsContainer>
    <HydrateClient>
      <ErrorBoundary fallback={<CredentialsError/>}>
        <Suspense fallback={<CredentialsLoading/>}>
            <CredentialsList />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
    </CredentialsContainer>
  )
}

export default page