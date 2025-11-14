"use client";

import { formatDistanceToNow } from "date-fns"
import { EmptyView, EntityContainer, EntityHeader, EntityItem, EntityList, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-components";
import { useCreateWorkflow, useRemoveWorkflow, useSuspenseWorkflows } from "../hooks/use-workflows";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "../hooks/use-workflows-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { on } from "events";
import type { Workflow } from "@/generated/prisma/client";
import { WorkflowIcon } from "lucide-react";
import { format } from "path";



export const WorkflowsSearch = () => {
    const[params,setParams]=useWorkflowsParams();
    const {searchValue,onSearchChange}= useEntitySearch({
        params,
        setParams,
    })

    return (
        <EntitySearch
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Search workflows"
        />
    );
}

export const WorkflowsList = () => {

   
    const workflows = useSuspenseWorkflows();

    return (
        <EntityList items={workflows.data?.items} getKey={(workflow) => workflow.id} renderItem={(workflow) => <WorkflowItem data={workflow}/>} emptyView={<Workflowsempty/>}/>
    )
};

export const WorkflowsHeader = ({disabled}:{disabled?:boolean}) => {
    const createWorkflow = useCreateWorkflow();
    const {handleError,modal}= useUpgradeModal();
    const router=useRouter();

    const handleCreateWorkflow = () => {
        createWorkflow.mutate(undefined,{
            onSuccess: (data) => {
                router.push(`/workflows/${data.id}`);
            },
            onError:(error) => {
                //Todo open upgrade model
                handleError(error);
                // console.error(error);
            }
        });
    }

    return(
        <>
            
           {modal}
            <EntityHeader
                title="Workflows"
                description="Create and manage workflows"
                onNew={handleCreateWorkflow}
                newButtonLabel="New Workflow"
                disabled={disabled}
                isCreating={createWorkflow.isPending}
            />
        </>
    )
}

export const WorkflowsPagination = () => {
    const workflows = useSuspenseWorkflows();
    const [params,setParams]=useWorkflowsParams();
    return(
        <EntityPagination disabled={workflows.isFetching} page={workflows.data?.page} onPageChange={(page) => setParams({...params,page})} totalPages={workflows.data?.totalPages}/>
    )
}

export const WorkflowsContainer = ({children}:{children:React.ReactNode}) => {
    return(
        <EntityContainer
         header={<WorkflowsHeader />}
         search={<WorkflowsSearch/>}
         pagination={<WorkflowsPagination/>}
        >
            {children}
        </EntityContainer>
    )
}

export const WorkflowsLoading = () =>{
    return (
        <LoadingView message="Loading workflows"/>
    )
}

export const WorkflowsError = () => {
    return (
        <ErrorView message="Failed to load workflows"/>
    )
}

export const Workflowsempty = () => {
    const createWorkflow = useCreateWorkflow();
    const {handleError,modal}= useUpgradeModal();

    const handleCreate = () => {
        const router=useRouter();
        createWorkflow.mutate(undefined,{
            onError:(error) => {
                handleError(error);
            },
            onSuccess: (data) => {
                 router.push(`/workflows/${data.id}`);
            }
        });
    }

    return (
      <>
      {modal}
        <EmptyView onNew={handleCreate} message="You haven't created any workflows yet. Get started by creating a workflow" />
    </>  
    )
}

export const WorkflowItem = ({
    data
}:{data:Workflow}) => {

    const removeWorkflow=useRemoveWorkflow();

    const handleRemove = () => {
        removeWorkflow.mutate({id:data.id});
    }

    return(
        <EntityItem
          href={`/workflows/${data.id}`}
          title={data.name}
          subtitle={
            <>
              Updated {formatDistanceToNow((data.updatedAt))} {"  "}
              &bull; Created{" "}
            
              {formatDistanceToNow((data.createdAt))} 
            </>
          }
          image={
            <div className="size-8 flex items-center justify-center ">
              <WorkflowIcon className="size-5 text-muted-foreground"/>
            </div>
          }

          onRemove={handleRemove}

          isRemoving={removeWorkflow.isPending}
        />
    )
}
