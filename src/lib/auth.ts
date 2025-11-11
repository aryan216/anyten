import {betterAuth} from "better-auth";
import { be } from "date-fns/locale";
import { prismaAdapter } from "better-auth/adapters/prisma";
import  prisma  from "@/lib/db";

export const auth = betterAuth({
   database: prismaAdapter(prisma,{
    provider: "postgresql",
   }),
   emailAndPassword:{
    enabled:true,
    autoSignIn: true
   }
}); 