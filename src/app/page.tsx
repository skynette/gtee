'use client';

import { useRef, useState, useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { RiTwitterXFill } from '@remixicon/react';
import { motion } from 'framer-motion';
import {
    BrainIcon,
    Sparkles,
    SparklesIcon,
    TrendingUpIcon,
    WalletIcon,
} from 'lucide-react';

import AIProcessSection from '@/components/ai-process';
import Features from '@/components/features-section';
import { Brand } from '@/components/logo';
import { AiParticlesBackground } from '@/components/ui/ai-particles-background';
import AnimatedShinyText from '@/components/ui/animated-shiny-text';
import BlurFade from '@/components/ui/blur-fade';
import { BorderBeam } from '@/components/ui/border-beam';
import { Button } from '@/components/ui/button';
import { RainbowButton } from '@/components/ui/rainbow-button';

interface GradientWrapperProps {
    children: React.ReactNode;
}

const GradientWrapper = ({ children }: GradientWrapperProps) => (
    <div className="relative">
        <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute right-1/4 top-1/3 h-96 w-96 animate-pulse rounded-full bg-secondary/10 blur-3xl" />
            <div className="absolute bottom-1/4 left-1/3 h-96 w-96 animate-pulse rounded-full bg-accent/10 blur-3xl" />
        </div>
        {children}
    </div>
);

const StatsCard = ({ label, value }: { label: string; value: string }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative overflow-hidden rounded-xl border bg-card/50 p-6 backdrop-blur-sm">
            <motion.div
                className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-secondary/5"
                animate={{
                    opacity: isHovered ? 0.3 : 0,
                }}
                transition={{ duration: 0.3 }}
            />

            <motion.h3
                className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl font-bold text-transparent"
                animate={{
                    scale: isHovered ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300 }}>
                {value}
            </motion.h3>
            <p className="text-sm text-muted-foreground">{label}</p>

            <motion.div
                className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-primary/5 blur-2xl"
                animate={{
                    scale: isHovered ? 1.5 : 1,
                    opacity: isHovered ? 0.4 : 0.2,
                }}
            />
        </motion.div>
    );
};

const MetricsPreviewCard = ({
    title,
    status,
}: {
    title: string;
    status: string;
}) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative overflow-hidden rounded-xl border bg-card/50 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUpIcon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-medium">{title}</h4>
                <p className="text-xs text-muted-foreground">{status}</p>
            </div>
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="h-2 w-2 rounded-full bg-primary"
            />
        </div>
    </motion.div>
);

const navItems = [
    {
        label: 'Github',
        href: 'https://github.com/d-a-ve',
        icon: GitHubLogoIcon,
    },
];

const Header = ({
    handleLogin,
}: {
    handleLogin: (address: string) => void;
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <BlurFade delay={0.1} className="relative z-50">
            <motion.header
                className="fixed left-0 right-0 top-0"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}>
                <div className="mx-auto max-w-6xl px-4 py-4">
                    <motion.div
                        className={`rounded-xl border border-border/50 ${
                            scrolled ? 'bg-background/80' : 'bg-muted/70'
                        } shadow-lg backdrop-blur-md transition-all duration-300`}
                        animate={{
                            borderColor: scrolled
                                ? 'rgba(255,255,255,0.2)'
                                : 'rgba(255,255,255,0.1)',
                        }}>
                        <div className="flex items-center justify-between px-4 py-2">
                            <motion.div
                                className="relative"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: 'spring', stiffness: 400 }}>
                                <Brand className="scale-95 transition-opacity hover:opacity-80" />
                            </motion.div>

                            <div className="flex items-center gap-3">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}>
                                    <Button
                                        variant="outline"
                                        className="h-9 rounded-lg bg-primary/10 px-4 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                                        onClick={() => handleLogin('')}>
                                        <SparklesIcon className="mr-2 h-4 w-4" />
                                        Docs
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.header>
        </BlurFade>
    );
};

const WalletInput = ({ onSubmit }: { onSubmit: (address: string) => void }) => {
    const [address, setAddress] = useState('');
    const [isHovered, setIsHovered] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(address);
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 sm:flex-row sm:items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}>
            <motion.div
                className="relative flex-1"
                whileHover={{ scale: 1.02 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}>
                <input
                    type="text"
                    placeholder="Enter Solana wallet address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-12 w-full rounded-lg border bg-background/80 px-4 pr-12 text-sm backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <motion.div
                    animate={{
                        scale: isHovered ? 1.1 : 1,
                        rotate: isHovered ? 360 : 0,
                    }}
                    transition={{ duration: 0.5 }}>
                    <WalletIcon className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary transition-colors" />
                </motion.div>
            </motion.div>
            <RainbowButton
                type="submit"
                className="h-12 min-w-[140px] text-base transition-all duration-300 hover:scale-105">
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Wallet
            </RainbowButton>
        </motion.form>
    );
};

const Hero = ({ handleLogin }: { handleLogin: (address: string) => void }) => (
    <GradientWrapper>
        <section className="relative pt-24">
            <div className="mx-auto max-w-screen-xl px-6">
                <BlurFade delay={0.3} className="relative">
                    {/* AI Badge */}
                    <div className="mb-8 flex justify-center">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="flex items-center gap-2 rounded-full border border-primary/20 bg-card/50 px-4 py-2 backdrop-blur-sm">
                            <BrainIcon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                Solana AI Analytics
                            </span>
                            <SparklesIcon className="h-4 w-4 text-primary" />
                        </motion.div>
                    </div>

                    {/* Main Hero Content */}
                    <div className="relative z-10 text-center">
                        <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                            <span className="block">Analyze Any</span>
                            <AnimatedShinyText>
                                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    Solana Wallet
                                </span>
                            </AnimatedShinyText>
                            <span className="block">With AI Insights</span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                            Enter any Solana wallet address to get detailed
                            AI-powered analytics, transaction history, and
                            performance metrics. Powered by advanced on-chain
                            analysis.
                        </p>

                        {/* Wallet Input */}
                        <div className="mx-auto mt-10 max-w-2xl">
                            <WalletInput onSubmit={handleLogin} />
                        </div>

                        {/* Live Metrics Preview */}
                        <div className="mx-auto mt-16 max-w-3xl">
                            <div className="grid gap-4 md:grid-cols-2">
                                <MetricsPreviewCard
                                    title="SOL Transaction History"
                                    status="Enter a wallet address to begin analysis"
                                />
                                <MetricsPreviewCard
                                    title="DeFi Activity"
                                    status="Scanning Solana protocols..."
                                />
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="mx-auto mt-16 max-w-4xl">
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <StatsCard
                                    label="Wallets Analyzed"
                                    value="50K+"
                                />
                                <StatsCard label="SOL Tracked" value="2M+" />
                                <StatsCard label="AI Accuracy" value="99%" />
                                <StatsCard
                                    label="Protocols Covered"
                                    value="100+"
                                />
                            </div>
                        </div>
                    </div>
                </BlurFade>
            </div>
        </section>
    </GradientWrapper>
);

const Footer = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <footer className="mt-auto py-8">
            <BlurFade delay={0.5}>
                <motion.div
                    className="flex items-center justify-center gap-4 text-sm text-muted-foreground"
                    whileHover={{ scale: 1.02 }}>
                    <motion.p
                        animate={{
                            color: isHovered
                                ? 'rgba(255,255,255,0.8)'
                                : 'rgba(255,255,255,0.5)',
                        }}>
                        © 2024 swap. All rights reserved.
                    </motion.p>
                    <span>|</span>
                    <motion.div
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ type: 'spring', stiffness: 300 }}>
                        <Link
                            href="https://x.com/swap_sh"
                            target="_blank"
                            title="Follow us on X"
                            className="transition-colors hover:text-primary"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}>
                            <RiTwitterXFill className="h-4 w-4" />
                        </Link>
                    </motion.div>
                </motion.div>
            </BlurFade>
        </footer>
    );
};

export default function Home() {
    const router = useRouter();
    
    const analyzeWallet = (address: string) => {
        console.log('Analyzing wallet:', address);
    };

    return (
        <motion.div 
            className="flex min-h-screen flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <AiParticlesBackground />
            
            <Header handleLogin={analyzeWallet} />
            
            <main className="flex-1">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Hero handleLogin={analyzeWallet} />
                    <AIProcessSection />
                    <Features />
                </motion.div>
            </main>
            
            <Footer />
        </motion.div>
    );
}