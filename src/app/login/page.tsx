"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
        },
    },
} as const;

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.4,
        },
    },
} as const;

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await signIn("credentials", {
                username: data.username,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else if (result?.ok) {
                // Redirect to dashboard on successful login
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-background p-4'>
            <motion.div
                variants={containerVariants}
                initial='hidden'
                animate='visible'
                className='w-full max-w-md'
            >
                <motion.div variants={cardVariants}>
                    <Card className='border-border shadow-lg'>
                        <CardHeader className='space-y-1'>
                            <motion.div variants={itemVariants}>
                                <CardTitle className='text-2xl font-bold text-foreground'>
                                    Welcome back
                                </CardTitle>
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <CardDescription className='text-muted-foreground'>
                                    Sign in to your account to continue
                                </CardDescription>
                            </motion.div>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className='space-y-4'
                                >
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className='p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm'
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    <motion.div variants={itemVariants}>
                                        <FormField
                                            control={form.control}
                                            name='username'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Username
                                                    </FormLabel>
                                                    <FormControl>
                                                        <motion.div
                                                            whileFocus={{
                                                                scale: 1.01,
                                                            }}
                                                            transition={{
                                                                type: "spring",
                                                                stiffness: 300,
                                                            }}
                                                        >
                                                            <Input
                                                                placeholder='Enter your username'
                                                                {...field}
                                                                disabled={
                                                                    isLoading
                                                                }
                                                                className='transition-all'
                                                            />
                                                        </motion.div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <FormField
                                            control={form.control}
                                            name='password'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Password
                                                    </FormLabel>
                                                    <FormControl>
                                                        <motion.div
                                                            whileFocus={{
                                                                scale: 1.01,
                                                            }}
                                                            transition={{
                                                                type: "spring",
                                                                stiffness: 300,
                                                            }}
                                                        >
                                                            <Input
                                                                type='password'
                                                                placeholder='Enter your password'
                                                                {...field}
                                                                disabled={
                                                                    isLoading
                                                                }
                                                                className='transition-all'
                                                            />
                                                        </motion.div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button
                                                type='submit'
                                                className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                        Signing in...
                                                    </>
                                                ) : (
                                                    "Sign in"
                                                )}
                                            </Button>
                                        </motion.div>
                                    </motion.div>

                                    <motion.div
                                        variants={itemVariants}
                                        className='text-center text-sm text-muted-foreground'
                                    >
                                        Don&apos;t have an account?{" "}
                                        <Link
                                            href='/register'
                                            className='text-primary hover:underline font-medium transition-colors'
                                        >
                                            Sign up
                                        </Link>
                                    </motion.div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}
