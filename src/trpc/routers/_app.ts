
import { inngest } from '@/inngest/client';
import {  createTRPCRouter, protectecProcedure } from '../init';
import prisma from '@/lib/db';
import { generateText } from 'ai';
import {google} from '@ai-sdk/google' 
import { TRPCError } from '@trpc/server';

export const appRouter = createTRPCRouter({
  testAi: protectecProcedure.mutation(async () => {
    // const { text } = await generateText({
    //   model: google("gemini-2.5-flash"),
    //   prompt: "define trpc",
    // });

    // return text;

    // throw new TRPCError({code:"BAD_REQUEST",message:"Something_went_wrong"})

    await inngest.send({
      name:"execute/ai",
      
    })
    return {success:true, message:"job queued"}

  }),
  getWorkflows: protectecProcedure.query(({ ctx }) => {
    console.log({ userId: ctx.auth.user.id });
    return prisma.workflow.findMany();
  }),

  createWorkflow: protectecProcedure.mutation(async () => {
    await inngest.send({
      name: "test/hello.world",
      data: {
        email: "abhaytripathi@gmail.com",
      },
    });

    // return prisma.workflow.create({
    //     data: {
    //       name:"test-workflow"
    //     }
    // })

    return { success: true, message: "job queued" };
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;