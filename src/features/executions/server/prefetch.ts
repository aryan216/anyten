import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";
import { ExecutionStatus } from "@/generated/prisma/enums";

type Input = inferInput<typeof trpc.executions.getMany>;

export const prefetchExecutions = (params: {
  page: number;
  pageSize: number;
  search: string;
  status: string | null;
  workflowId: string | null;
}) => {
  const validatedParams: Input = {
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    status: params.status && Object.values(ExecutionStatus).includes(params.status as ExecutionStatus)
      ? (params.status as ExecutionStatus)
      : null,
    workflowId: params.workflowId || null,
  };
  return prefetch(trpc.executions.getMany.queryOptions(validatedParams));
};

export const prefetchExecution = (id: string) => {
  return prefetch(trpc.executions.getOne.queryOptions({ id }));
};

