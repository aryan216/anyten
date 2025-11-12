import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { execute } from "@/inngest/functions";
import {generateText} from "ai"
// import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Create an API that serves zero functions

// const google= createGoogleGenerativeAI();

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    execute,
  ],
});