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
import { useSuspenseExecutions } from "../hooks/use-executions";
import { useExecutionsParams } from "../hooks/use-executions-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import type { Execution } from "@/generated/prisma/client";
import { ExecutionStatus } from "@/generated/prisma/enums";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";
import { HistoryIcon, CheckCircle2Icon, XCircleIcon, ClockIcon, Loader2Icon, BanIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  ExecutionStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  [ExecutionStatus.PENDING]: {
    label: "Pending",
    icon: ClockIcon,
    variant: "outline",
  },
  [ExecutionStatus.RUNNING]: {
    label: "Running",
    icon: Loader2Icon,
    variant: "default",
  },
  [ExecutionStatus.SUCCESS]: {
    label: "Success",
    icon: CheckCircle2Icon,
    variant: "default",
  },
  [ExecutionStatus.ERROR]: {
    label: "Error",
    icon: XCircleIcon,
    variant: "destructive",
  },
  [ExecutionStatus.CANCELLED]: {
    label: "Cancelled",
    icon: BanIcon,
    variant: "secondary",
  },
};

export const ExecutionsSearch = () => {
  const [params, setParams] = useExecutionsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search executions"
    />
  );
};

type ExecutionsData = inferRouterOutputs<AppRouter>["executions"]["getMany"];
type ExecutionItem = ExecutionsData["items"][number];

export const ExecutionsList = () => {
  const executions = useSuspenseExecutions() as { data: ExecutionsData };

  return (
    <EntityList<ExecutionItem>
      items={executions.data?.items || []}
      getKey={(execution) => execution.id}
      renderItem={(execution) => <ExecutionItem data={execution} />}
      emptyView={<ExecutionsEmpty />}
    />
  );
};

export const ExecutionsHeader = ({ disabled }: { disabled?: boolean }) => {
  return (
    <EntityHeader
      title="Executions"
      description="View and track workflow execution history"
      disabled={disabled}
    />
  );
};

export const ExecutionsPagination = () => {
  const executions = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();
  return (
    <EntityPagination
      disabled={executions.isFetching}
      page={executions.data?.page || 1}
      onPageChange={(page) => setParams({ ...params, page })}
      totalPages={executions.data?.totalPages || 1}
    />
  );
};

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<ExecutionsHeader />}
      search={<ExecutionsSearch />}
      pagination={<ExecutionsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const ExecutionsLoading = () => {
  return <LoadingView message="Loading executions" />;
};

export const ExecutionsError = () => {
  return <ErrorView message="Failed to load executions" />;
};

export const ExecutionsEmpty = () => {
  return (
    <EmptyView message="No executions found. Execute a workflow to see execution history here." />
  );
};

export const ExecutionItem = ({ data }: { data: Execution & { workflow: { id: string; name: string }; _count: { logs: number } } }) => {
  const statusInfo = statusConfig[data.status];
  const StatusIcon = statusInfo.icon;

  const duration = data.completedAt
    ? Math.round((data.completedAt.getTime() - data.startedAt.getTime()) / 1000)
    : null;

  return (
    <EntityItem
      href={`/executions/${data.id}`}
      title={data.workflow.name}
      subtitle={
        <>
          {data.status === ExecutionStatus.RUNNING ? (
            <>Running since {formatDistanceToNow(data.startedAt)} ago</>
          ) : data.completedAt ? (
            <>
              Completed {formatDistanceToNow(data.completedAt)} ago
              {duration !== null && ` • ${duration}s`}
            </>
          ) : (
            <>Started {formatDistanceToNow(data.startedAt)} ago</>
          )}
          {" • "}
          {data._count.logs} {data._count.logs === 1 ? "log" : "logs"}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <HistoryIcon className="size-5 text-muted-foreground" />
        </div>
      }
      actions={
        <Badge
          variant={statusInfo.variant}
          className={cn(
            "flex items-center gap-1",
            data.status === ExecutionStatus.RUNNING && "animate-pulse"
          )}
        >
          <StatusIcon
            className={cn(
              "size-3",
              data.status === ExecutionStatus.RUNNING && "animate-spin"
            )}
          />
          {statusInfo.label}
        </Badge>
      }
    />
  );
};

