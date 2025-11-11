"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {toast} from "sonner"
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { Card, CardContent,CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

 import { Input } from "@/components/ui/input";
 import { cn } from "@/lib/utils";
import { use } from "react";
import { authClient } from "@/lib/auth-client";

 const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),

});

type loginFormValues = z.infer<typeof loginSchema>;

export function LoginForm(){
    const router = useRouter();
    const form = useForm<loginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
          email: "",
          password: "",
        },
    });

    const onSubmit = async (values: loginFormValues) => {
        await authClient.signIn.email(
            {
               
                email: values.email,
                password: values.password,
                callbackURL: "/"
            },
            {
                onSuccess: () => {
                    router.push("/");
                    toast.success("login successful");
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message);
                }
            }
        )
    }

    const isPending = form.formState.isSubmitting;

    return(
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>Welcome</CardTitle>
                    <CardDescription>Login to continue</CardDescription>  
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid gap-6">
                                <div className="flex flex-col gap-4">
                                    <Button
                                      variant="outline"
                                      className="w-full"
                                      type="button"
                                      disabled={isPending}
                                    >
                                        Continue With Github
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="w-full"
                                      type="button"
                                      disabled={isPending}
                                    >
                                        Continue With Google
                                    </Button>
                                </div>
                                <div className="grid gap-6">
                                    <FormField
                                      control={form.control}
                                      name="email"
                                      render={({ field  })=>(
                                        <FormItem>

                                          <FormLabel>Email</FormLabel>
                                          <FormControl>
                                            <Input type="email" placeholder="example@gmail.com" {...field} />
                                          </FormControl>
                                          <FormMessage />

                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="password"
                                      render={({ field  })=>(
                                        <FormItem>

                                          <FormLabel>Password</FormLabel>
                                          <FormControl>
                                            <Input type="password" placeholder="********" {...field} />
                                          </FormControl>
                                          <FormMessage />

                                        </FormItem>
                                      )}
                                    />

                                    <Button type="submit" disabled={isPending}>Login</Button>



                                </div>
                                <div className="text-center text-sm">
                                    Don&apos;t have an account? {" "}
                                    <Link href="/signup" className="underline underline-offset-4 hover:text-primary">Sign Up</Link>
                                </div>
                            </div>
                        </form>    
                    </Form>
                </CardContent>
            </Card>

        </div>
    )


}