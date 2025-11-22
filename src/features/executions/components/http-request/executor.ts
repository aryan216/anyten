import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { Options as kyOptions, HTTPError } from "ky";
import Handlebars from "handlebars";
import { httpRequestChannel } from "@/inngest/channels/http-request";

Handlebars.registerHelper("json", (context) => {
    const JSONString = JSON.stringify(context, null, 2);
    return new Handlebars.SafeString(JSONString); // ✅ Add return
});

type HttpRequestData = {
    variableName?: string;
    endpoint?: string;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: string;
}

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    await publish(httpRequestChannel().status({
        nodeId,
        status: "loading",
    }));

    // ✅ Validate required fields
    if (!data.variableName) {
        await publish(httpRequestChannel().status({
            nodeId,
            status: "error",
        }));
        throw new NonRetriableError("Http Request node: No Variable Name Configured");
    }

    if (!data.endpoint) {
        await publish(httpRequestChannel().status({
            nodeId,
            status: "error",
        }));
        throw new NonRetriableError("Http Request node: No Endpoint Configured");
    }

    if (!data.method) {
        await publish(httpRequestChannel().status({
            nodeId,
            status: "error",
        }));
        throw new NonRetriableError("Http Request node: No Method Configured");
    }

    // ✅ Wrap the entire step.run in try-catch
    try {
        const result = await step.run("http-request", async () => {
            const endpoint = Handlebars.compile(data.endpoint!)(context);
            console.log("ENDPOINT", { endpoint });
            const method = data.method!;

            const options: kyOptions = {
                method: method, // ✅ Add method to options
            };

            if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
                try {
                    const resolved = Handlebars.compile(data.body || "{}")(context);
                    const parsedBody = JSON.parse(resolved); // ✅ Validate JSON
                    options.json = parsedBody; // ✅ Use json instead of body
                } catch (jsonError) {
                    throw new NonRetriableError(
                        `Invalid JSON in request body: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`
                    );
                }
            }

            // ✅ Make the HTTP request
            const response = await ky(endpoint, options);
            const contentType = response.headers.get("content-type");
            const responseData = contentType?.includes("application/json")
                ? await response.json()
                : await response.text();

            const responsePayload = {
                httpResponse: {
                    status: response.status,
                    statusText: response.statusText,
                    data: responseData
                }
            };

            return {
                ...context,
                [data.variableName!]: responsePayload,
            };
        });

        // ✅ Publish success status AFTER successful execution
        await publish(httpRequestChannel().status({
            nodeId,
            status: "success",
        }));

        return result;

    } catch (error) {
        // ✅ Publish error status
        await publish(httpRequestChannel().status({
            nodeId,
            status: "error",
        }));

        // ✅ Handle different error types
        if (error instanceof HTTPError) {
            const errorBody = await error.response.text().catch(() => "Unable to read error body");
            throw new NonRetriableError(
                `HTTP Request failed with status ${error.response.status}: ${errorBody}`
            );
        }

        if (error instanceof NonRetriableError) {
            throw error; // ✅ Re-throw NonRetriableError as-is
        }

        // ✅ Handle other errors
        throw new NonRetriableError(
            `HTTP Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};