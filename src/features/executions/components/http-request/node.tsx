"use client"

import {Node ,NodeProps,useReactFlow} from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import {memo,useState} from "react";
import { BaseExecutionNode } from "./base-execution-node";
import { HttpRequestDialog } from "./dialog-http";
import { HTTPRequestFormValues } from "./dialog-http";

type HttpRequestNodeData = {
    endpoint?: string;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: string;
   
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
    const [dialogOpen,setDialogOpen] = useState(false);
    const {setNodes} =   useReactFlow();

    const nodeData=props.data ;
    const nodeStatus="initial";
    const description= nodeData?.endpoint ? `${nodeData.method || "GET"}  : ${nodeData.endpoint}` : "Not Configured" ; 

    const handleOpenSettings = () => {
        setDialogOpen(true);
    }

    const handleSubmit=(values:HTTPRequestFormValues) => {
       setNodes((nodes)=>nodes.map((node)=>{
           if(node.id===props.id){
               return {
                   ...node,
                   data:{...node.data,
                       ...values
                   }
               }
           }
           return node;

       }))
    }
    
    return (
        <>
          <HttpRequestDialog open={dialogOpen} onOpenChange={setDialogOpen} OnSubmit={handleSubmit} defaultValues={nodeData} />
            
            
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon={GlobeIcon}
                name="HTTP Request"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )

})

HttpRequestNode.displayName="HttpRequestNode"