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

const formSchema = z.object({
   variableName: z
  .string()
  .min(1, { message: "Please enter a variable name" })
  .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, {
    message: "Variable name must start with a letter or underscore and contain only letters, numbers, or underscores",
  }),
   
    content:z.string().min(1,{message:"Please enter a message content"}).max(40000,{message:"Message content must be less than 40000 characters"}),
    webhookUrl:z.string().min(1,{message:"Please enter a webhook url"}).url({message:"Please enter a valid webhook URL"}),
})

export type SlackFormValues=z.infer<typeof formSchema>

 interface Props {
    open :boolean;
    onOpenChange:(open:boolean)=>void;
    OnSubmit:(values: z.infer<typeof formSchema>) => void
    defaultValues?:Partial<SlackFormValues>
 }

 export const SlackDialog = ({
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
          
        }
    })

    useEffect(()=>{
        if(open){
            form.reset({
            variableName:defaultValues.variableName || "",
            webhookUrl:defaultValues.webhookUrl || "",
            content:defaultValues.content || "",
            
        })
        }
    },[defaultValues,form,open])

    const watchVariableName=form.watch("variableName") || "mySlack";

    const handleSubmit=(values:z.infer<typeof formSchema>) => {
        OnSubmit(values);
        onOpenChange(false);
    }

     return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Slack Webhook</DialogTitle>
                    <DialogTitle>Configure the Slack webhook settings for this node</DialogTitle>
                </DialogHeader>
                <DialogDescription className="py-4">
                    <p className="text-sm text-muted-foreground">Send messages to Slack using an Incoming Webhook URL</p>
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
                                        <Input placeholder="mySlack" {...field} />
                                    </FormControl>
                                    <FormDescription>Use this name to reference the result in other nodes: {" "} {`{{${watchVariableName}.messageContent}}`}</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )} />

                        <FormField
                            control={form.control}
                            name="webhookUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Incoming Webhook URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://hooks.slack.com/services/..." {...field} />
                                    </FormControl>
                                    <FormDescription>Slack → App settings → Incoming Webhooks → Add New Webhook to Workspace</FormDescription>
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

                        
                     

                            <DialogFooter className="mt-4">
                                <Button type="submit">Save</Button>
                            </DialogFooter> 
                    </form>
                </Form>    
            </DialogContent>
        </Dialog>
     )
 }


