import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useExecutionsParams } from "./use-executions-params";
import { ExecutionStatus } from "@/generated/prisma/enums";

export const useSuspenseExecutions = () => {
  const trpc = useTRPC();
  const [params] = useExecutionsParams();
  
  const validatedParams = {
    ...params,
    status: params.status && Object.values(ExecutionStatus).includes(params.status as ExecutionStatus)
      ? (params.status as ExecutionStatus)
      : null,
  };
  
  return useSuspenseQuery(trpc.executions.getMany.queryOptions(validatedParams));
};

export const useSuspenseExecution = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.executions.getOne.queryOptions({ id }));
};

