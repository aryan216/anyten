"use client"

import {type NodeProps,Position } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import {memo ,type ReactNode ,useCallback} from "react";
import {BaseNode,BaseNodeContent} from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { WorkflowNode } from "@/components/workflow-node";

interface BaseTriggerNodeProps extends NodeProps{
    icon: LucideIcon | string,
    name: string
   
    description?: string,
    children?: ReactNode
    onSettings?: () => void
    onDoubleClick?: () => void
}

export const BaseTriggerNode = memo(({id,icon:Icon,name,description,children,onSettings,onDoubleClick}:BaseTriggerNodeProps) => {

    const handleDelete =() => { }

    return (
        <WorkflowNode
            name={name}
            description={description}
            onDelete={handleDelete}
            onSettings={onSettings}
        >
            <BaseNode onDoubleClick={onDoubleClick} className="rounded-2xl relative group">
                <BaseNodeContent>
                    {typeof Icon === "string" ? (
                        <Image src={Icon} alt="Icon" width={16} height={16} />
                    ) : (
                        <Icon size={24} />
                    )}

                    {children}
                    {/* <BaseHandle id="target-1" type="target" position={Position.Left} /> */}
                     <BaseHandle id="target-1" type="source" position={Position.Right} />
                </BaseNodeContent>
            </BaseNode>

        </WorkflowNode>
    )
})

BaseTriggerNode.displayName = "BaseTriggerNode"