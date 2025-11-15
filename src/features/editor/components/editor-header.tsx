"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SaveIcon } from "lucide-react";

import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {Input} from "@/components/ui/input"
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSuspenseWorkflow, useUpdateWorkflowName } from "@/features/workflows/hooks/use-workflows";
import { Editor } from "./editor";

export const EditorSaveButton = ({workflowId}:{workflowId:string}) => {
    return (
        <div className="ml-auto">
            <Button size="sm" onClick={()=>{}} disabled={false}>
                <SaveIcon className="size-4"/>
                save
            </Button>
        </div>
    );
}

export const EditorBreadcrumbs = ({workflowId}:{workflowId:string}) =>{
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link prefetch href="/workflows">Workflows</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <EditorNameInput workflowId={workflowId}/>
            </BreadcrumbList>
        </Breadcrumb>
    )
}


export const EditorNameInput = ({workflowId}:{workflowId:string}) => {
    


    const {data:workflow} = useSuspenseWorkflow(workflowId);

    const updateWorkflow = useUpdateWorkflowName();

    const [isEditing,setIsEditing] = useState(false);
    const [name,setName] = useState(workflow.name);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(()=>{
        if(workflow.name){
            setName(workflow.name);
        } 
    },[workflow.name]);


    useEffect(()=>{
        if(isEditing && inputRef.current){
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    },[isEditing]);
const handleSave = async () => {
  if (name === workflow.name) {
    setIsEditing(false);
    return;
  }

  setIsEditing(false);

  try {
    await updateWorkflow.mutateAsync(
      {
        id: workflow.id,
        name: name,
      });
  } catch (error) {
    setName(workflow.name);
  } 
};

const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
  if (event.key === "Enter") {
    handleSave();
  }else if(event.key === "Escape"){
    setName(workflow.name);
    setIsEditing(false);
  }
};


if(isEditing){
    return (
        <Input ref={inputRef} disabled={updateWorkflow.isPending} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKeyDown} onBlur={handleSave} className="h-7 w-auto min-w-[100px] px-2"/>
    )
}


    return (
        <BreadcrumbItem onClick={() => setIsEditing(true)} className="cursor-pointer hover:text-foreground transition-colors">
          {workflow.name}
        </BreadcrumbItem>
    )
    
}

export const EditorHeader = ({workflowId}:{workflowId:string}) => {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
      <SidebarTrigger />
      <div className="flex flex-row items-center justify-between gap-x-4 w-full">
        <EditorBreadcrumbs workflowId={workflowId}/>
        <EditorSaveButton workflowId={workflowId}/>
      </div>
    </header>
  );
};
