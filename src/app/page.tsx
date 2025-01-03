'use client';

import { useEffect, useRef, useState } from 'react';

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
import Hero from '@/components/hero';
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

    const handleWalletAnalysis = (address: string) => {
        try {
            if (!address) {
                console.error('Please enter a wallet address');
                return;
            }

            // Basic Solana address validation
            if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
                console.error('Invalid Solana wallet address');
                return;
            }

            // Navigate to the analysis page
            router.push(`/wallet/${address}`);
        } catch (error) {
            console.error('Error processing wallet address');
            console.error('Navigation error:', error);
        }
    };

    return (
        <motion.div
            className="flex min-h-screen flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}>
            <AiParticlesBackground />

            <Header handleLogin={handleWalletAnalysis} />

            <main className="flex-1">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}>
                    <Hero handleLogin={handleWalletAnalysis} />
                    <AIProcessSection />
                    <Features />
                </motion.div>
            </main>

            <Footer />
        </motion.div>
    );
}
