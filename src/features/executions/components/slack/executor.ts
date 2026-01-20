import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import {decode} from "html-entities";
import { slackChannel } from "@/inngest/channels/slack";
import ky from "ky";

Handlebars.registerHelper("json", (context) => {
    const JSONString = JSON.stringify(context, null, 2);
    return new Handlebars.SafeString(JSONString); 
});

type SlackData = {
    variableName?: string;
    webhookUrl?: string;
    content?: string;

}

export const slackExecutor: NodeExecutor<SlackData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    await publish(slackChannel().status({
        nodeId,
        status: "loading",
    }));

    if(!data.content){
        await publish(
            slackChannel().status({
                nodeId,
                status: "error",
            })
        );
        throw new NonRetriableError("Slack node: Message content is required.");
    }

    const rawContent = Handlebars.compile(data.content)(context);
    const content = decode(rawContent);
    // const username = data.username ? decode(Handlebars.compile(data.username)(context)) : undefined;

    try {
       const result = await step.run("slack-webhook", async () => {
        if(!data.variableName){
            await publish(
                slackChannel().status({
                    nodeId,
                    status: "error",
                })
            );
            throw new NonRetriableError("Slack node: Variable name is missing.");       
        }

        if(!data.webhookUrl){
            await publish(
                slackChannel().status({
                    nodeId,
                    status: "error",
                })
            );
            throw new NonRetriableError("Slack node: Webhook URL is required.");
        }

        // Slack Incoming Webhooks use { text: "..." }
        await ky.post(data.webhookUrl, {
            json: {
                content: content.slice(0,40000), //the key depends on webhook config
               
            },
        });

        return {
            ...context,
            [data.variableName]: {
                messageContent: content.slice(0,40000),
            },
        };
       });

       await publish(slackChannel().status({
        nodeId,
        status: "success",
    }));
    return result;
    } catch (error: any) {
        await publish(slackChannel().status({
            nodeId,
            status: "error",
        }));
        throw new NonRetriableError(
            `Slack node: Failed to send webhook. ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};


