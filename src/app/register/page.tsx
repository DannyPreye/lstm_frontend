"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { AuthService } from "@/lib/api/services/AuthService";
import type { RegisterRequest } from "@/lib/api/models/RegisterRequest";
import { getErrorMessage } from "@/lib/utils/error-handler";

const registerSchema = z
    .object({
        email: z.string().email("Please enter a valid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Passwords do not match",
        path: ["password_confirmation"],
    });

type RegisterFormValues = z.infer<typeof registerSchema>;

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

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

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            password_confirmation: "",
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const registerRequest: RegisterRequest = {
                username: data.email, // Use email as username
                email: data.email,
                password: data.password,
                password_confirmation: data.password_confirmation,
            };

            const response = await AuthService.authRegisterCreate(
                registerRequest
            );

            if (response) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            }
        } catch (err) {
            setError(getErrorMessage(err));
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
                                    Create an account
                                </CardTitle>
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <CardDescription className='text-muted-foreground'>
                                    Enter your information to get started
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

                                    {success && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className='p-3 rounded-md bg-primary/10 border border-primary/20 text-primary text-sm'
                                        >
                                            Account created successfully!
                                            Redirecting to login...
                                        </motion.div>
                                    )}

                                    <motion.div variants={itemVariants}>
                                        <FormField
                                            control={form.control}
                                            name='email'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
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
                                                                type='email'
                                                                placeholder='Enter your email'
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
                                                            className='relative'
                                                        >
                                                            <Input
                                                                type={
                                                                    showPassword
                                                                        ? "text"
                                                                        : "password"
                                                                }
                                                                placeholder='Enter your password'
                                                                {...field}
                                                                disabled={
                                                                    isLoading
                                                                }
                                                                className='transition-all pr-10'
                                                            />
                                                            <button
                                                                type='button'
                                                                onClick={() =>
                                                                    setShowPassword(
                                                                        !showPassword
                                                                    )
                                                                }
                                                                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                                                                disabled={
                                                                    isLoading
                                                                }
                                                            >
                                                                {showPassword ? (
                                                                    <EyeOff className='h-4 w-4' />
                                                                ) : (
                                                                    <Eye className='h-4 w-4' />
                                                                )}
                                                            </button>
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
                                            name='password_confirmation'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Confirm Password
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
                                                            className='relative'
                                                        >
                                                            <Input
                                                                type={
                                                                    showPasswordConfirmation
                                                                        ? "text"
                                                                        : "password"
                                                                }
                                                                placeholder='Confirm your password'
                                                                {...field}
                                                                disabled={
                                                                    isLoading
                                                                }
                                                                className='transition-all pr-10'
                                                            />
                                                            <button
                                                                type='button'
                                                                onClick={() =>
                                                                    setShowPasswordConfirmation(
                                                                        !showPasswordConfirmation
                                                                    )
                                                                }
                                                                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                                                                disabled={
                                                                    isLoading
                                                                }
                                                            >
                                                                {showPasswordConfirmation ? (
                                                                    <EyeOff className='h-4 w-4' />
                                                                ) : (
                                                                    <Eye className='h-4 w-4' />
                                                                )}
                                                            </button>
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
                                                disabled={isLoading || success}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                        Creating account...
                                                    </>
                                                ) : (
                                                    "Create account"
                                                )}
                                            </Button>
                                        </motion.div>
                                    </motion.div>

                                    <motion.div
                                        variants={itemVariants}
                                        className='text-center text-sm text-muted-foreground'
                                    >
                                        Already have an account?{" "}
                                        <Link
                                            href='/login'
                                            className='text-primary hover:underline font-medium transition-colors'
                                        >
                                            Sign in
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
