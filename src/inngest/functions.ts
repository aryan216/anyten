import prisma from "@/lib/db";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {createOpenAI} from "@ai-sdk/openai";
import {createAnthropic} from "@ai-sdk/anthropic"
import { generateText } from "ai";

const google= createGoogleGenerativeAI({
    // apiKey:process.env.CUSTOM_GEMINI_KEY
});

const openai = createOpenAI()

const anthropic = createAnthropic()

export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {

    await step.sleep("ptretend-to-sleep","5s")

    const {steps: geminiSteps} = await step.ai.wrap("gemini-generate-text",generateText,{
        model:google("gemini-2.5-flash"),
        system:"you are a helpful assistant.",
        prompt:"what is 2+2 ?"
    })

    const {steps: openaiSteps} = await step.ai.wrap("openAI-generate-text",generateText,{
        model:openai("gpt-4"),
        system:"you are a helpful assistant.",
        prompt:"what is 2+2 ?"
    })

    const {steps: anthropicSteps} = await step.ai.wrap("anthropic-generate-text",generateText,{
        model:anthropic("claude-haiku-4-5"),
        system:"you are a helpful assistant.",
        prompt:"what is 2+2 ?"
    })
    // return { message: `Hello ${event.data.email}!` };
    return {geminiSteps,openaiSteps,anthropicSteps};
  },
);