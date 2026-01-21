
import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { TopologicalSort } from "./utils";
import { NodeType, ExecutionStatus, LogLevel } from "@/generated/prisma/enums";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { geminiChannel } from "./channels/gemini";
import { discordChannel } from "./channels/discord";
import { slackChannel } from "./channels/slack";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { 
    event: "workflows/execute.workflow" ,
    channels: [httpRequestChannel(),manualTriggerChannel(),googleFormTriggerChannel(),stripeTriggerChannel(),geminiChannel(),discordChannel(),slackChannel()]
  },
  async ({ event, step , publish }) => {
    const workflowId=event.data.workflowId;

    if(!workflowId){
        throw new NonRetriableError("workflowId is required");
    }
    
    // Create execution record
    const execution = await step.run("create-execution", async () => {
        const workflow = await prisma.workflow.findUniqueOrThrow({
            where:{id:workflowId},
            select:{
                userId:true,
                name:true
            }
        });

        const execution = await prisma.execution.create({
            data:{
                workflowId,
                status:ExecutionStatus.PENDING,
            }
        });

        // Log execution start
        await prisma.executionLog.create({
            data:{
                executionId:execution.id,
                level:LogLevel.INFO,
                message:`Workflow "${workflow.name}" execution started`,
            }
        });

        return execution;
    });

    try {
        // Update status to RUNNING
        await step.run("update-execution-running", async () => {
            await prisma.execution.update({
                where:{id:execution.id},
                data:{status:ExecutionStatus.RUNNING}
            });

            await prisma.executionLog.create({
                data:{
                    executionId:execution.id,
                    level:LogLevel.INFO,
                    message:"Workflow execution in progress",
                }
            });
        });

        const sortedNodes = await step.run("prepare-workflow",async() =>{
            const workflow = await prisma.workflow.findUniqueOrThrow({
                where:{id:workflowId},
                include:{
                    nodes:true,
                    connections:true
                }
            });

            await prisma.executionLog.create({
                data:{
                    executionId:execution.id,
                    level:LogLevel.INFO,
                    message:`Prepared workflow with ${workflow.nodes.length} nodes`,
                    data:{nodeCount:workflow.nodes.length}
                }
            });

            return TopologicalSort(workflow.nodes,workflow.connections);
        })

        const userId=await step.run("get-user-id",async()=>{
            const workflow=await prisma.workflow.findUniqueOrThrow({
                where:{id:workflowId},
                select:{
                    userId:true
                }
            });
            return workflow.userId;
        });

        let {context} = event.data.initialData || {};

        // Execute each node
        for (const node of sortedNodes) {
            try {
                await prisma.executionLog.create({
                    data:{
                        executionId:execution.id,
                        nodeId:node.id,
                        nodeName:node.name,
                        level:LogLevel.INFO,
                        message:`Executing node: ${node.name} (${node.type})`,
                        data:{nodeType:node.type}
                    }
                });

                const executor = getExecutor(node.type as NodeType);
                context = await executor({
                    data:node.data as Record<string,unknown>,
                    nodeId:node.id,
                    userId,
                    context,
                    step,
                    publish
                });

                await prisma.executionLog.create({
                    data:{
                        executionId:execution.id,
                        nodeId:node.id,
                        nodeName:node.name,
                        level:LogLevel.INFO,
                        message:`Node "${node.name}" completed successfully`,
                    }
                });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                
                await prisma.executionLog.create({
                    data:{
                        executionId:execution.id,
                        nodeId:node.id,
                        nodeName:node.name,
                        level:LogLevel.ERROR,
                        message:`Node "${node.name}" failed: ${errorMessage}`,
                        data:{error:errorMessage}
                    }
                });

                throw error;
            }
        }

        // Update execution to SUCCESS
        await step.run("update-execution-success", async () => {
            await prisma.execution.update({
                where:{id:execution.id},
                data:{
                    status:ExecutionStatus.SUCCESS,
                    completedAt:new Date(),
                    result:context
                }
            });

            await prisma.executionLog.create({
                data:{
                    executionId:execution.id,
                    level:LogLevel.INFO,
                    message:"Workflow execution completed successfully",
                    data:{result:context}
                }
            });
        });

        return {
            workflowId,
            executionId:execution.id,
            result:context
        };
    } catch (error) {
        // Update execution to ERROR
        await step.run("update-execution-error", async () => {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            
            await prisma.execution.update({
                where:{id:execution.id},
                data:{
                    status:ExecutionStatus.ERROR,
                    completedAt:new Date(),
                    error:errorMessage
                }
            });

            await prisma.executionLog.create({
                data:{
                    executionId:execution.id,
                    level:LogLevel.ERROR,
                    message:`Workflow execution failed: ${errorMessage}`,
                    data:{error:errorMessage}
                }
            });
        });

        throw error;
    }
  },
);