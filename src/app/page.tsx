"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    TrendingUp,
    BarChart3,
    LineChart,
    Brain,
    ArrowRight,
    Sparkles,
} from "lucide-react";

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

export default function HomePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Redirect authenticated users to dashboard
    useEffect(() => {
        if (status === "authenticated" && session) {
            router.push("/dashboard");
        }
    }, [session, status, router]);

    // Show loading state while checking session
    if (status === "loading") {
        return (
            <div className='min-h-screen bg-background flex items-center justify-center'>
                <div className='text-muted-foreground'>Loading...</div>
            </div>
        );
    }

    // Don't render if authenticated (redirecting)
    if (status === "authenticated") {
        return null;
    }

    const features = [
        {
            icon: Brain,
            title: "LSTM Forecasting",
            description:
                "Advanced deep learning models predict commodity prices with high accuracy using Long Short-Term Memory networks.",
        },
        {
            icon: BarChart3,
            title: "Historical Analysis",
            description:
                "Explore comprehensive historical price data with interactive charts and detailed analytics for informed decision-making.",
        },
        {
            icon: LineChart,
            title: "Price Predictions",
            description:
                "Generate monthly forecasts for commodity prices to plan ahead and optimize your agricultural business strategy.",
        },
        {
            icon: TrendingUp,
            title: "Real-time Insights",
            description:
                "Access up-to-date market trends and seasonal patterns to make data-driven decisions for your commodities.",
        },
    ];

    return (
        <div className='min-h-screen bg-background'>
            {/* Hero Section */}
            <motion.div
                variants={containerVariants}
                initial='hidden'
                animate='visible'
                className='relative overflow-hidden'
            >
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24'>
                    <motion.div
                        variants={itemVariants}
                        className='text-center space-y-6'
                    >
                        <motion.div
                            variants={itemVariants}
                            className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4'
                        >
                            <Sparkles className='h-4 w-4' />
                            AI-Powered Commodity Forecasting
                        </motion.div>
                        <h1 className='text-4xl md:text-6xl font-bold text-foreground tracking-tight'>
                            Predict Commodity Prices
                            <br />
                            <span className='text-primary'>
                                with LSTM Models
                            </span>
                        </h1>
                        <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
                            Leverage advanced machine learning to forecast
                            commodity prices and make informed decisions for
                            your agricultural business.
                        </p>
                        <motion.div
                            variants={itemVariants}
                            className='flex flex-col sm:flex-row gap-4 justify-center items-center pt-4'
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link href='/login'>
                                    <Button
                                        size='lg'
                                        className='w-full sm:w-auto shadow-lg'
                                    >
                                        Sign In
                                        <ArrowRight className='ml-2 h-4 w-4' />
                                    </Button>
                                </Link>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link href='/register'>
                                    <Button
                                        variant='outline'
                                        size='lg'
                                        className='w-full sm:w-auto shadow-lg'
                                    >
                                        Create Account
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Features Section */}
            <motion.div
                variants={containerVariants}
                initial='hidden'
                animate='visible'
                className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-32'
            >
                <motion.div
                    variants={itemVariants}
                    className='text-center mb-12'
                >
                    <h2 className='text-3xl md:text-4xl font-bold text-foreground mb-4'>
                        Powerful Features
                    </h2>
                    <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                        Everything you need to analyze and predict commodity
                        prices effectively
                    </p>
                </motion.div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                variants={itemVariants}
                                whileHover={{ y: -5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className='h-full shadow-lg border-border/50 hover:shadow-xl transition-shadow'>
                                    <CardHeader>
                                        <div className='flex items-center gap-3 mb-2'>
                                            <div className='rounded-lg bg-primary/10 p-2'>
                                                <Icon className='h-6 w-6 text-primary' />
                                            </div>
                                            <CardTitle className='text-xl'>
                                                {feature.title}
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className='text-base leading-relaxed'>
                                            {feature.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
                variants={containerVariants}
                initial='hidden'
                animate='visible'
                className='bg-muted/50 py-16 md:py-24'
            >
                <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
                    <motion.div variants={itemVariants}>
                        <h2 className='text-3xl md:text-4xl font-bold text-foreground mb-4'>
                            Ready to Get Started?
                        </h2>
                        <p className='text-lg text-muted-foreground mb-8 max-w-2xl mx-auto'>
                            Join us today and start forecasting commodity prices
                            with cutting-edge AI technology.
                        </p>
                        <motion.div
                            variants={itemVariants}
                            className='flex flex-col sm:flex-row gap-4 justify-center'
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link href='/register'>
                                    <Button
                                        size='lg'
                                        className='w-full sm:w-auto shadow-lg'
                                    >
                                        Create Free Account
                                        <ArrowRight className='ml-2 h-4 w-4' />
                                    </Button>
                                </Link>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link href='/login'>
                                    <Button
                                        variant='outline'
                                        size='lg'
                                        className='w-full sm:w-auto shadow-lg'
                                    >
                                        Sign In
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
