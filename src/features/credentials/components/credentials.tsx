"use client";

import { formatDistanceToNow } from "date-fns";
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import {
  useRemoveCredential,
  useSuspenseCredentials,
} from "../hooks/use-credentials";

import { useParams, useRouter } from "next/navigation";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { useEntitySearch } from "@/hooks/use-entity-search";

import type {  Credential } from "@/generated/prisma/client";
import { CredentialType } from "@/generated/prisma/enums";
import { WorkflowIcon } from "lucide-react";
import Image from "next/image";

export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search credentials"
    />
  );
};

export const CredentialsList = () => {
  const credentials = useSuspenseCredentials();

  return (
    <EntityList
      items={credentials.data?.items}
      getKey={(credential) => credential.id}
      renderItem={(credential) => <CredentialItem data={credential} />}
      emptyView={<Credentialsempty />}
    />
  );
};

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
  return (
    <>
      <EntityHeader
        title="Credentials"
        description="Create and manage credentials"
        newButtonHref="/credentials/new"
        newButtonLabel="New Credential"
        disabled={disabled}
      />
    </>
  );
};

export const CredentialsPagination = () => {
  const workflows = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();
  return (
    <EntityPagination
      disabled={workflows.isFetching}
      page={workflows.data?.page}
      onPageChange={(page) => setParams({ ...params, page })}
      totalPages={workflows.data?.totalPages}
    />
  );
};

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<CredentialsHeader />}
      search={<CredentialsSearch />}
      pagination={<CredentialsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const CredentialsLoading = () => {
  return <LoadingView message="Loading credentials" />;
};

export const CredentialsError = () => {
  return <ErrorView message="Failed to load credentials" />;
};

export const Credentialsempty = () => {
  const router = useRouter();

  const handleCreate = () => {
    router.push(`/credentials/new`);
  };

  return (
    <EmptyView
      onNew={handleCreate}
      message="You haven't created any credentials yet. Get started by creating a credential"
    />
  );
};

const credentialLogos: Record<CredentialType, string> = {
  [CredentialType.OPENAI]: "/logo/openai.svg",
  [CredentialType.ANTHROPIC]: "/logo/anthropic.svg",
  [CredentialType.GEMINI]: "/logo/gemini.svg",
};

export const CredentialItem = ({ data }: { data: Credential }) => {
  const removeCredential = useRemoveCredential();

  const handleRemove = () => {
    removeCredential.mutate({ id: data.id });
  };

  const logo= credentialLogos[data.type ] || "/logo/openai.svg";

  return (
    <EntityItem
      href={`/credentials/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(data.updatedAt)} {"  "}
          &bull; Created {formatDistanceToNow(data.createdAt)}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center ">
          <Image src={logo} alt={data.type} height={20} width={20} />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeCredential.isPending}
    />
  );
};


export const CredentialView = () => {
  const params = useParams();
  const credentialId = params.credentialId as string;
}