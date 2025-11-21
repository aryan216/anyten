import { GetStepTools,Inngest } from "inngest";

export type WorkflowContest = Record<string,unknown>;

export type StepTools = GetStepTools<Inngest.Any>;

export interface NodeExecutorParams <TData = Record<string,unknown>>{
    data:TData,
    nodeId:string,
    context:WorkflowContest
    step:StepTools
}

export type NodeExecutor<TData = Record<string,unknown>> = (params:NodeExecutorParams<TData>) => Promise<WorkflowContest>;