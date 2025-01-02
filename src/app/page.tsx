'use client';

import { useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { RiTwitterXFill } from '@remixicon/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    ActivityIcon,
    ArrowRightIcon,
    BarChart3Icon,
    BrainIcon,
    ChartBarIcon,
    RocketIcon,
    ShieldIcon,
    SparklesIcon,
    TrendingUpIcon,
    WalletIcon,
} from 'lucide-react';

import { Brand } from '@/components/logo';
import { AiParticlesBackground } from '@/components/ui/ai-particles-background';
import AnimatedShinyText from '@/components/ui/animated-shiny-text';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import BlurFade from '@/components/ui/blur-fade';
import { BorderBeam } from '@/components/ui/border-beam';
import { Button } from '@/components/ui/button';
import { IntegrationsBackground } from '@/components/ui/integrations-background';
import Marquee from '@/components/ui/marquee';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { cn } from '@/lib/utils';

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

interface StatsCardProps {
    label: string;
    value: string;
}

const StatsCard = ({ label, value }: StatsCardProps) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        className="group relative overflow-hidden rounded-xl border bg-card/50 p-6 backdrop-blur-sm"
    >
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 transition-opacity group-hover:opacity-100" />
        <h3 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl font-bold text-transparent">
            {value}
        </h3>
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
    </motion.div>
);

const MetricsPreviewCard = () => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative overflow-hidden rounded-xl border bg-card/50 p-4 backdrop-blur-sm"
    >
        <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUpIcon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-medium">Portfolio Performance</h4>
                <p className="text-xs text-muted-foreground">
                    AI Analysis in Progress...
                </p>
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

interface HeaderProps {
    handleLogin: () => void;
}

const Header = ({ handleLogin }: HeaderProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <BlurFade delay={0.1} className="relative z-50">
            <header className="fixed left-0 right-0 top-0">
                <div className="mx-auto max-w-6xl px-4 py-4">
                    <div className="rounded-xl border border-border/50 bg-muted/70 shadow-lg backdrop-blur-md">
                        <div className="flex items-center justify-between px-4 py-2">
                            <div className="relative">
                                <Brand className="scale-95 transition-opacity hover:opacity-80" />
                            </div>

                            <nav className="hidden md:ml-auto md:mr-8 md:flex"></nav>

                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    className="h-9 rounded-lg px-4 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                                    onClick={handleLogin}
                                >
                                    Connect Wallet
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </BlurFade>
    );
};

interface HeroProps {
    handleLogin: () => void;
}

const Hero = ({ handleLogin }: HeroProps) => (
    <GradientWrapper>
        <section className="relative pt-24">
            <div className="mx-auto max-w-screen-xl px-6">
                <BlurFade delay={0.3} className="relative">
                    {/* AI Badge */}
                    <div className="mb-8 flex justify-center">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="flex items-center gap-2 rounded-full border border-primary/20 bg-card/50 px-4 py-2 backdrop-blur-sm"
                        >
                            <BrainIcon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                AI-Powered Wallet Analysis
                            </span>
                            <SparklesIcon className="h-4 w-4 text-primary" />
                        </motion.div>
                    </div>

                    {/* Main Hero Content */}
                    <div className="relative z-10 text-center">
                        <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                            <span className="block">Transform Your</span>
                            <AnimatedShinyText>
                                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    Crypto Portfolio
                                </span>
                            </AnimatedShinyText>
                            <span className="block">With AI Insights</span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                            Instantly analyze your wallet, track performance,
                            and receive AI-driven investment recommendations.
                            Real-time metrics powered by advanced machine
                            learning.
                        </p>

                        {/* CTAs */}
                        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                            <RainbowButton
                                onClick={handleLogin}
                                className="group relative h-12 min-w-[200px] overflow-hidden text-base"
                            >
                                <WalletIcon className="mr-2 h-4 w-4" />
                                Connect Wallet
                                <div className="absolute inset-0 -z-10 animate-pulse bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 transition-opacity group-hover:opacity-100" />
                            </RainbowButton>

                            <Button
                                variant="outline"
                                className="h-12 min-w-[200px] gap-2 bg-background/50 text-base backdrop-blur-sm"
                            >
                                See How It Works
                                <ArrowRightIcon className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Live Metrics Preview */}
                        <div className="mx-auto mt-16 max-w-3xl">
                            <div className="grid gap-4 md:grid-cols-2">
                                <MetricsPreviewCard />
                                <MetricsPreviewCard />
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="mx-auto mt-16 max-w-4xl">
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <StatsCard
                                    label="Wallets Analyzed"
                                    value="10K+"
                                />
                                <StatsCard
                                    label="Daily Predictions"
                                    value="1M+"
                                />
                                <StatsCard label="AI Accuracy" value="99%" />
                                <StatsCard label="User Growth" value="47%" />
                            </div>
                        </div>
                    </div>
                </BlurFade>
            </div>
        </section>
    </GradientWrapper>
);

const AIProcessSection = () => (
    <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 text-center">
                <span className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-muted/80 px-4 py-1.5 text-sm font-medium text-primary">
                    <ActivityIcon className="mr-2 h-4 w-4" />
                    How It Works
                </span>
                <h2 className="mt-4 text-3xl font-bold md:text-4xl">
                    AI-Powered Analysis Pipeline
                </h2>
                <p className="mt-4 text-muted-foreground">
                    From wallet connection to actionable insights in seconds
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {[
                    {
                        icon: WalletIcon,
                        title: 'Connect Wallet',
                        description:
                            'Securely link your crypto wallet with one click',
                    },
                    {
                        icon: BrainIcon,
                        title: 'AI Analysis',
                        description:
                            'Our AI models analyze your transaction history and patterns',
                    },
                    {
                        icon: ChartBarIcon,
                        title: 'Get Insights',
                        description:
                            'Receive personalized metrics and investment recommendations',
                    },
                ].map((step, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -5 }}
                        className="group relative rounded-xl border bg-card/50 p-6 backdrop-blur-sm"
                    >
                        <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                            <step.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold">
                            {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {step.description}
                        </p>
                        <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

const features = [
    {
        Icon: BrainIcon,
        name: 'Advanced AI Analysis',
        description:
            'Our cutting-edge AI models analyze your portfolio in real-time, providing predictive insights and personalized recommendations based on market conditions and your trading patterns.',
        className: 'col-span-1 sm:col-span-3 lg:col-span-2',
        background: (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="relative h-full w-full">
                    <div className="absolute left-10 top-10 h-32 w-32 animate-blob rounded-full bg-primary/30 mix-blend-multiply blur-xl"></div>
                    <div className="animation-delay-2000 absolute right-10 top-10 h-32 w-32 animate-blob rounded-full bg-secondary/30 mix-blend-multiply blur-xl"></div>
                </div>
            </div>
        ),
    },
    {
        Icon: ChartBarIcon,
        name: 'Real-time Metrics',
        description:
            'Access detailed analytics including profit/loss tracking, portfolio diversification scores, and risk assessments updated in real-time.',
        className: 'col-span-1 sm:col-span-3 lg:col-span-1',
        background: (
            <Marquee
                pauseOnHover
                className="absolute inset-0 [--duration:15s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]"
            >
                {Array.from({ length: 5 }).map((_, idx) => (
                    <div
                        key={idx}
                        className="mx-2 flex items-center gap-2 rounded-xl border border-primary/20 bg-muted/30 px-3 py-2"
                    >
                        <div className="text-sm font-medium">
                            {idx % 2 === 0
                                ? 'Live Analytics'
                                : 'Real-time Insights'}
                        </div>
                    </div>
                ))}
            </Marquee>
        ),
    },
    {
        Icon: TrendingUpIcon,
        name: 'AI Investment Insights',
        description:
            'Receive personalized investment recommendations, market trend analysis, and risk warnings based on your transaction history and current market conditions.',
        className: 'col-span-1 sm:col-span-3 lg:col-span-3',
        background: <IntegrationsBackground />,
    },
    {
        Icon: ShieldIcon,
        name: 'Security & Privacy',
        description:
            'Your wallet data is analyzed securely with end-to-end encryption. We never store private keys or sensitive information.',
        className: 'col-span-1 sm:col-span-3 lg:col-span-1',
        background: (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="h-32 w-32 animate-pulse rounded-full border-4 border-accent"></div>
            </div>
        ),
    },
    {
        Icon: RocketIcon,
        name: 'Smart Portfolio Optimization',
        description:
            'Get AI-powered suggestions for portfolio rebalancing, profit-taking strategies, and risk management based on your investment goals.',
        className: 'col-span-1 sm:col-span-3 lg:col-span-2',
        background: (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="h-32 w-32 animate-pulse rounded-full border-4 border-accent"></div>
            </div>
        ),
    },
];

interface AIFeatureCardProps {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}

const AIFeatureCard = ({
    title,
    description,
    icon: Icon,
}: AIFeatureCardProps) => (
    <div className="flex flex-col items-center rounded-xl border bg-card/50 p-6 text-center backdrop-blur-sm transition-all hover:scale-105 hover:bg-card/70">
        <div className="mb-4 rounded-full bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
    </div>
);

const Features = () => {
    return (
        <BlurFade delay={0.5} className="relative py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="mb-12 text-center sm:mb-16">
                    <span className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-muted/80 px-4 py-1.5 text-sm font-medium text-primary">
                        <BrainIcon className="mr-2 h-4 w-4" />
                        AI-Powered Features
                    </span>
                    <h2 className="mb-3 text-2xl font-bold tracking-tight sm:mb-4 sm:text-4xl">
                        Smart Crypto Analytics
                    </h2>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Leverage the power of artificial intelligence for
                        comprehensive portfolio analysis
                    </p>
                </div>

                {/* AI Features Grid */}
                <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <AIFeatureCard
                        icon={BarChart3Icon}
                        title="Predictive Analytics"
                        description="AI-powered price predictions and trend analysis"
                    />
                    <AIFeatureCard
                        icon={ActivityIcon}
                        title="Risk Assessment"
                        description="Real-time portfolio risk evaluation and alerts"
                    />
                    <AIFeatureCard
                        icon={RocketIcon}
                        title="Smart Suggestions"
                        description="Personalized investment recommendations"
                    />
                </div>

                <BentoGrid className="grid-rows-[auto]">
                    {features.map((feature, idx) => (
                        <BentoCard
                            key={idx}
                            {...feature}
                            className={cn(
                                'group relative overflow-hidden rounded-2xl border bg-card p-4 shadow-lg transition-all hover:shadow-xl sm:rounded-3xl sm:p-6',
                                feature.className,
                            )}
                        />
                    ))}
                </BentoGrid>
            </div>
        </BlurFade>
    );
};

const Footer = () => {
    return (
        <footer className="mt-auto py-4">
            <BlurFade
                delay={0.5}
                className="flex items-center justify-center gap-3 text-sm text-muted-foreground"
            >
                <p>© 2024 Neur. All rights reserved.</p>
                <span>|</span>
                <Link
                    href="https://x.com/neur_sh"
                    target="_blank"
                    title="Follow us on X"
                    className="transition-colors hover:scale-105 hover:text-primary"
                >
                    <RiTwitterXFill className="h-4 w-4" />
                </Link>
            </BlurFade>
        </footer>
    );
};

export default function Home() {
    const router = useRouter();
    const login = () => {
        console.log('open wallet connection dialog here');
    };

    return (
        <div className="flex min-h-screen flex-col">
            <AiParticlesBackground />
            <Header handleLogin={login} />
            <main className="flex-1">
                <Hero handleLogin={login} />
                <AIProcessSection />
                <Features />
            </main>
            <Footer />
        </div>
    );
}
