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

const formSchema = z.object({
   variableName: z
  .string()
  .min(1, { message: "Please enter a variable name" })
  .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, {
    message: "Variable name must start with a letter or underscore and contain only letters, numbers, or underscores",
  }),
    endpoint:z.url({message:"Please enter a valid url"}),
    method:z.enum(["GET","POST","PUT","DELETE","PATCH"]),
    body:z.string().optional()

})

export type HTTPRequestFormValues=z.infer<typeof formSchema>

 interface Props {
    open :boolean;
    onOpenChange:(open:boolean)=>void;
    OnSubmit:(values: z.infer<typeof formSchema>) => void
    defaultValues?:Partial<HTTPRequestFormValues>
 }

 export const HttpRequestDialog = ({
    open,
    onOpenChange,
    OnSubmit,
    defaultValues={}
}:Props) => {

    const form= useForm<z.infer<typeof formSchema>>({
        resolver:zodResolver(formSchema),
        defaultValues: {
            variableName:defaultValues.variableName || "",
            endpoint:defaultValues.endpoint || "",
            method:defaultValues.method || "GET",
            body:defaultValues.body || ""
        }
    })

    useEffect(()=>{
        if(open){
            form.reset({
            variableName:defaultValues.variableName || "",    
            endpoint:defaultValues.endpoint || "",
            method:defaultValues.method || "GET",
            body:defaultValues.body || ""
        })
        }
    },[defaultValues,form,open])

    const watchVariableName=form.watch("variableName") || "myApiCall";
    const watchMethod=form.watch("method")
    const showBodyField=["POST","PUT","DELETE","PATCH"].includes(watchMethod);

    const handleSubmit=(values:z.infer<typeof formSchema>) => {
        OnSubmit(values);
        onOpenChange(false);
    }

     return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>HTTP Request Trigger</DialogTitle>
                    <DialogTitle>Configure setting for http trigger node.</DialogTitle>
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
                                    <FormDescription>Use this name to reference the result in other nodes: {" "} {`{{${watchVariableName}.httpResponse.data}}`}</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )} />
                       
                        <FormField
                            control={form.control}
                            name="method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Method</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a method"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="GET">GET</SelectItem>
                                            <SelectItem value="POST">POST</SelectItem>
                                            <SelectItem value="PUT">PUT</SelectItem>
                                            <SelectItem value="DELETE">DELETE</SelectItem>
                                            <SelectItem value="PATCH">PATCH</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription> The HTTP metyhod to use this request</FormDescription>
                                    <FormMessage/>
                                </FormItem>


                            )} />
                        <FormField
                            control={form.control}
                            name="endpoint"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Endpoint</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://api.example.com/users/{{httpResponse.data.id}}"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription> Static URL or use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringyfy objects</FormDescription>
                                    <FormMessage/>
                                </FormItem>


                            )} />   

                            {showBodyField && (
                                <FormField
                                    control={form.control}
                                    name="body"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Request Body</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="The body of the request"
                                                    className="min-h-[120px] font-mono text-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription> JSON with template variables. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringyfy objects</FormDescription>
                                            <FormMessage/>
                                        </FormItem>
                                    )} />
                            )}

                            <DialogFooter className="mt-4">
                                <Button type="submit">Save</Button>
                            </DialogFooter> 
                    </form>
                </Form>    
            </DialogContent>
        </Dialog>
     )
 }