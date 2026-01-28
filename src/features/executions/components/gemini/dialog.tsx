"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
 } from "@/components/ui/dialog"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { CredentialType } from "@/generated/prisma/enums";
import Image from "next/image";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

const Available_Models=["gemini-2.5-flash","gemini-1.5-flash-8b","gemini-1.5-pro","gemini-1.0-pro","gemini-pro"] as const;

type Credential = inferRouterOutputs<AppRouter>["credentials"]["getByType"][number];


const formSchema = z.object({
   variableName: z
  .string()
  .min(1, { message: "Please enter a variable name" })
  .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, {
    message: "Variable name must start with a letter or underscore and contain only letters, numbers, or underscores",
  }),
    credentialId:z.string().min(1,{message:"Please select a credential"}),
    model:z.string().min(1,{message:"Model is required"}),
    systemPrompt:z.string().optional(),
    userPrompt:z.string().min(1,{message:"Please enter a user prompt"}),


})

export type GeminiFormValues=z.infer<typeof formSchema>

 interface Props {
    open :boolean;
    onOpenChange:(open:boolean)=>void;
    OnSubmit:(values: z.infer<typeof formSchema>) => void
    defaultValues?:Partial<GeminiFormValues>
 }

 export const GeminiDialog = ({
    open,
    onOpenChange,
    OnSubmit,
    defaultValues={}
}:Props) => {

    const {data:credentials,isLoading:isLoadingCredentials} = useCredentialsByType(CredentialType.GEMINI);

    const form= useForm<z.infer<typeof formSchema>>({
        resolver:zodResolver(formSchema),
        defaultValues: {
            variableName:defaultValues.variableName || "",
            model:defaultValues.model || Available_Models[0],
            credentialId:defaultValues.credentialId || "",
            systemPrompt:defaultValues.systemPrompt || "",
            userPrompt:defaultValues.userPrompt || ""
        }
    })

    useEffect(()=>{
        if(open){
            form.reset({
            variableName:defaultValues.variableName || "",
            model:defaultValues.model || Available_Models[0],
            systemPrompt:defaultValues.systemPrompt || "",
            userPrompt:defaultValues.userPrompt || ""
        })
        }
    },[defaultValues,form,open])

    const watchVariableName=form.watch("variableName") || "myApiCall";


    const handleSubmit=(values:z.infer<typeof formSchema>) => {
        OnSubmit(values);
        onOpenChange(false);
    }

     return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Gemini Request Trigger</DialogTitle>
                    <DialogTitle>Configure the Ai model and prompts for this node</DialogTitle>
                </DialogHeader>
                <DialogDescription className="py-4">
                    <p className="text-sm text-muted-foreground">Used to manually Execute a workflow no configurations avaiable</p>
                </DialogDescription>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 m-4">

                        

                       <FormField
                            control={form.control}
                            name="variableName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Variable Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="myApiCall" {...field} />
                                    </FormControl>
                                    <FormDescription>Use this name to reference the result in other nodes: {" "} {`{{${watchVariableName}.text}}`}</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )} />


                            <FormField
                            control={form.control}
                            name="credentialId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gemini Credential</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isLoadingCredentials || ((credentials as Credential[] | undefined)?.length || 0) === 0}
                                    >
                                        <FormControl className="w-full">
                                            <SelectTrigger >
                                                <SelectValue placeholder="Select a Credential" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {(credentials as Credential[] | undefined)?.map((credential) => (
                                                <SelectItem key={credential.id} value={credential.id}>
                                                    <div className="flex items-center gap-2">
                                                        <Image src="/logo/gemini.svg" alt={credential.name} height={16} width={16} className="mr-2"/>
                                                    {credential.name}
                                                    </div>
                                                    </SelectItem>
                                            ))}
                                        </SelectContent>

                                    </Select>
                                   
                                    <FormMessage/>
                                </FormItem>
                            )} />

                            <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Model</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl className="w-full">
                                            <SelectTrigger >
                                                <SelectValue placeholder="Select a model" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Available_Models.map((model)=>(
                                                <SelectItem key={model} value={model}>{model}</SelectItem>
                                            ))}
                                        </SelectContent>

                                    </Select>
                                    <FormDescription>The Google Gemini model to use for completion</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )} />
                       
                     
                   
                                <FormField
                                    control={form.control}
                                    name="systemPrompt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>System Prompt</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="You are a helpful assistant"
                                                    className="min-h-[120px] font-mono text-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription> Sets the behaviour of the assistant. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringyfy objects</FormDescription>
                                            <FormMessage/>
                                        </FormItem>
                                    )} />

                                 <FormField
                                    control={form.control}
                                    name="userPrompt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>User Prompt</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Summarize this text: {{JSON httpResponse.data}}"
                                                    className="min-h-[120px] font-mono text-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription> The prompt is sent to AI. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringyfy objects</FormDescription>
                                            <FormMessage/>
                                        </FormItem>
                                    )} />   
                     

                            <DialogFooter className="mt-4">
                                <Button type="submit">Save</Button>
                            </DialogFooter> 
                    </form>
                </Form>    
            </DialogContent>
        </Dialog>
     )
 }