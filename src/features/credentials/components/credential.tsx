"use client";

import {CredentialType} from "@/generated/prisma/enums";
import { useRouter } from "next/navigation";
import { useCreateCredential, useUpdateCredential } from "../hooks/use-credentials";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";


const formSchema= z.object({
    name: z.string().min(1,{message:"Name is required"}),
    type: z.enum(CredentialType),
    value: z.string().min(1,{message:"API key is required"})
})

type FormValues= z.infer<typeof formSchema>;

interface CredentialFormProps {
    initialData?:{
        id?:string;
        name:string;
        type:CredentialType;
        value:string;
    };
}

const CredentialTypesOptions= [
    {label:"OpenAI",value:CredentialType.OPENAI,logo:"/logo/openai.svg"},
    {label:"Anthropic",value:CredentialType.ANTHROPIC ,logo:"/logo/anthropic.svg"},
    {label:"Gemini",value:CredentialType.GEMINI, logo:"/logo/gemini.svg"},
];

export const CredentialForm = ({initialData}:CredentialFormProps) => {
    const router= useRouter();
    const createCredential= useCreateCredential();
    const updateCredential= useUpdateCredential();
    const {handleError,modal}= useUpgradeModal();

    const isEdit=!!initialData?.id;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name:"",
            type:CredentialType.OPENAI,
            value:""
        }
    })

    return (
        <>
        {modal}
        <Card className="shadow-none">
            <CardHeader>
                <CardTitle>
                    {isEdit ? "Edit Credential" : "Create Credential"}
                </CardTitle>
                <CardDescription>
                    {isEdit ? "Update your api key or credential details" : "Add a new API key or credential to your account"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(async (values)=>{
                        try{
                            if(isEdit){
                                await updateCredential.mutateAsync({
                                    id:initialData!.id!,
                                    ...values

                                  
                                })
                            } else {
                                await createCredential.mutateAsync(values,{
                                    onSuccess:(data)=>{
                                        router.push(`/credentials/${data.id}`);
                                    }
                                });
                                 
                            }
                            
                        } catch (error){
                            handleError(error);
                        }
                    })} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({field})=>(
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="My OpenAI Key" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({field})=>(
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a credential type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CredentialTypesOptions.map((option)=>(
                                                    <SelectItem key={option.value} value={option.value}>
                                                        <div className="flex items-center gap-2">
                                                            <Image
                                                                src={option.logo}
                                                                alt={option.label}
                                                                width={16}
                                                                height={16}
                                                            />
                                                            {option.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="value"
                            render={({field})=>(
                                <FormItem>
                                    <FormLabel>API Key / Credential Value</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="sk-xxxxxx"
                                            
                                            {...field}
                                        />  
                                    </FormControl>
                                    <FormDescription>
                                        Enter the API key or credential value associated with this credential.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-4">
                            <Button type="submit" disabled={createCredential.isPending || updateCredential.isPending} >
                            {isEdit ? "Update " : "Create "}
                        </Button>
                            <Button   onClick={()=>router.back()} type="button" variant="outline" asChild >
                                <Link href="/credentials" prefetch>Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>                    

        </Card>
        </>
    )
}