import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointer2Icon } from "lucide-react";
import { ManualTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";
import { fetchManualTriggerRealtimeToken } from "./actions";

export const ManualTriggerNode = memo((props:NodeProps) => {
    
    const [dialogOpen,setDialogOpen] = useState(false);

       const nodeStatus=useNodeStatus({
            nodeId:props.id,
            channel:manualTriggerChannel().name,
            topic:"status",
            refreshToken:fetchManualTriggerRealtimeToken
        })
    
    const handleOpenSettings = () => {
        setDialogOpen(true);
    }

    return (<>

    <ManualTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    <BaseTriggerNode {...props} icon={MousePointer2Icon} name="Wnen clicking 'Execute Workflow'" status={nodeStatus.status} onSettings={handleOpenSettings} onDoubleClick={handleOpenSettings}/>
    </>
      
      
    );
});