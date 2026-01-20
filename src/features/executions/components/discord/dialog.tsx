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


import { Textarea } from "@/components/ui/textarea";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const Available_Models=["gemini-2.5-flash","gemini-1.5-flash-8b","gemini-1.5-pro","gemini-1.0-pro","gemini-pro"] as const;


const formSchema = z.object({
   variableName: z
  .string()
  .min(1, { message: "Please enter a variable name" })
  .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, {
    message: "Variable name must start with a letter or underscore and contain only letters, numbers, or underscores",
  }),
    username:z.string().optional(),
    content:z.string().min(1,{message:"Please enter a message content"}).max(2000,{message:"Message content must be less than 2000 characters"}),
    webhookUrl:z.string().min(1,{message:"Please enter a webhook url"}),



})

export type DiscordFormValues=z.infer<typeof formSchema>

 interface Props {
    open :boolean;
    onOpenChange:(open:boolean)=>void;
    OnSubmit:(values: z.infer<typeof formSchema>) => void
    defaultValues?:Partial<DiscordFormValues>
 }

 export const DiscordDialog = ({
    open,
    onOpenChange,
    OnSubmit,
    defaultValues={}
}:Props) => {

    const form= useForm<z.infer<typeof formSchema>>({
        resolver:zodResolver(formSchema),
        defaultValues: {
            variableName:defaultValues.variableName || "",
            webhookUrl:defaultValues.webhookUrl || "",
            content:defaultValues.content || "",
            username:defaultValues.username || ""
        }
    })

    useEffect(()=>{
        if(open){
            form.reset({
            variableName:defaultValues.variableName || "",
            webhookUrl:defaultValues.webhookUrl || "",
            content:defaultValues.content || "",
            username:defaultValues.username || ""
        })
        }
    },[defaultValues,form,open])

    const watchVariableName=form.watch("variableName") || "myDiscord";


    const handleSubmit=(values:z.infer<typeof formSchema>) => {
        OnSubmit(values);
        onOpenChange(false);
    }

     return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Discord Webhook</DialogTitle>
                    <DialogTitle>Configure the Discord webhook settings for this node</DialogTitle>
                </DialogHeader>
                <DialogDescription className="py-4">
                    <p className="text-sm text-muted-foreground">Send messages to Discord using a webhook URL</p>
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
                                        <Input placeholder="myDiscord" {...field} />
                                    </FormControl>
                                    <FormDescription>Use this name to reference the result in other nodes: {" "} {`{{${watchVariableName}.text}}`}</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )} />

                        <FormField
                            control={form.control}
                            name="webhookUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Webhook URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://discord.com/api/webhooks/..." {...field} />
                                    </FormControl>
                                    <FormDescription>Get this from your Discord: channel settings → Webhooks → Create Webhook</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )} />

                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message Content</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Hello from Anyten! {{variableName}}" className="min-h-[120px] font-mono text-sm" {...field} />
                                    </FormControl>
                                    <FormDescription>Message content to send. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify objects</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )} />

                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Webhook Bot" {...field} />
                                    </FormControl>
                                    <FormDescription>Override the default username of the webhook</FormDescription>
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