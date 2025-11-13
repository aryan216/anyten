import {checkout,polar,portal} from "@polar-sh/better-auth"
import {betterAuth} from "better-auth";
import { be } from "date-fns/locale";
import { prismaAdapter } from "better-auth/adapters/prisma";
import  prisma  from "@/lib/db";
import {polarClient} from "./polar";

export const auth = betterAuth({
   database: prismaAdapter(prisma,{
    provider: "postgresql",
   }),
   emailAndPassword:{
    enabled:true,
    autoSignIn: true
   },
   plugins:[
      polar({
         client:polarClient,
         createCustomerOnSignUp:true,
         use:[
            checkout({
               products:[{
                  productId:"108fe5c2-bca2-4a50-b589-49c313db441e",
                  slug:"pro"
               }],
               successUrl:process.env.POLAR_SUCCESS_URL,
               authenticatedUsersOnly:true
            }),
            portal({})
         ]
      }) 
   ]
}); 