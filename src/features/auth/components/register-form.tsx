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

 const registerSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type registerFormValues = z.infer<typeof registerSchema>;

export function RegisterForm(){
    const router = useRouter();
    const form = useForm<registerFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
          email: "",
          password: "",
          confirmPassword: "",
        },
    });

    const onSubmit = async (values: registerFormValues) => {
        await authClient.signUp.email(
            {
                name: values.email,
                email: values.email,
                password: values.password,
                callbackURL: "/"
            },
            {
                onSuccess: () => {
                    router.push("/");
                    toast.success("Registration successful");
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
                    <CardTitle>Get Started</CardTitle>
                    <CardDescription>Create your account to get started</CardDescription>  
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
                                      <Image alt="github-logo" src="/logo/github.svg" width={20} height={20}/>
                                        Continue With Github
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="w-full"
                                      type="button"
                                      disabled={isPending}
                                    >
                                      <Image alt="google-logo" src="/logo/google.svg" width={20} height={20}/>
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

                                    <FormField
                                      control={form.control}
                                      name="confirmPassword"
                                      render={({ field  })=>(
                                        <FormItem>

                                          <FormLabel>Confirm Password</FormLabel>
                                          <FormControl>
                                            <Input type="confirm password" placeholder="********" {...field} />
                                          </FormControl>
                                          <FormMessage />

                                        </FormItem>
                                      )}
                                    />

                                    <Button type="submit" disabled={isPending}>Signup</Button>



                                </div>
                                <div className="text-center text-sm">
                                    Already have an account? {" "}
                                    <Link href="/login" className="underline underline-offset-4 hover:text-primary">Login</Link>
                                </div>
                            </div>
                        </form>    
                    </Form>
                </CardContent>
            </Card>

        </div>
    )


}