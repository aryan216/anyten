
import { inngest } from '@/inngest/client';
import {  createTRPCRouter, protectecProcedure } from '../init';
import prisma from '@/lib/db';
export const appRouter = createTRPCRouter({
  getWorkflows: protectecProcedure
    .query(({ctx}) => {

        console.log({userId: ctx.auth.user.id})
      return prisma.workflow.findMany()
    
    }),

    createWorkflow:protectecProcedure.mutation(async () => {
       
      await inngest.send({
          name:"test/hello.world",
          data:{
            email:"abhaytripathi@gmail.com"
          }
        })

        // return prisma.workflow.create({
        //     data: {
        //       name:"test-workflow"
        //     }
        // })

        return {success:true , message:"job queued"}
    })

});
// export type definition of API
export type AppRouter = typeof appRouter;