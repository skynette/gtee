import { useRef } from 'react';

import { motion, useInView } from 'framer-motion';
import {
    ActivityIcon,
    BarChart3Icon,
    BrainIcon,
    ChartBarIcon,
    LucideIcon,
    RocketIcon,
    ShieldIcon,
    TrendingUpIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { IntegrationsBackground } from './ui/integrations-background';
import Marquee from './ui/marquee';

interface AIFeatureCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    gradient: string;
    delay?: number;
}

interface Feature {
    Icon: LucideIcon;
    name: string;
    description: string;
    className: string;
    background: React.ReactNode;
    gradient?: string;
}

const Features = () => {
    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, { once: true });

    const AIFeatureCard = ({
        title,
        description,
        icon: Icon,
        gradient,
        delay = 0,
    }: AIFeatureCardProps) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay }}
            className="group relative">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-black/50 to-black/10 p-6 backdrop-blur-xl">
                <div
                    className={`absolute inset-0 -z-10 bg-gradient-to-br ${gradient} opacity-10 transition-opacity duration-500 group-hover:opacity-20`}
                />
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl transition-colors duration-500 group-hover:from-purple-500/30 group-hover:to-blue-500/30" />
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative z-10 flex flex-col items-center">
                    <div className="mb-4 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 transition-all duration-300 group-hover:ring-white/20">
                        <Icon className="h-6 w-6 text-purple-400 transition-colors group-hover:text-purple-300" />
                    </div>
                    <h3 className="mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-xl font-semibold text-transparent">
                        {title}
                    </h3>
                    <p className="text-center text-sm text-muted-foreground transition-colors group-hover:text-muted-foreground/80">
                        {description}
                    </p>
                </motion.div>
            </Card>
        </motion.div>
    );

    const features: Feature[] = [
        {
            Icon: BrainIcon,
            name: 'Advanced Solana Analytics',
            description:
                'Our AI analyzes every transaction, token transfer, and smart contract interaction on the Solana blockchain to provide comprehensive insights.',
            className: 'col-span-1 sm:col-span-3 lg:col-span-2',
            gradient: 'from-purple-600/20 via-violet-600/20 to-indigo-600/20',
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
            name: 'SOL Token Metrics',
            description:
                'Track SOL balance changes, token holdings, NFTs, and DeFi positions across the Solana ecosystem.',
            className: 'col-span-1 sm:col-span-3 lg:col-span-1',
            gradient: 'from-purple-600/20 via-violet-600/20 to-indigo-600/20',
            background: (
                <Marquee
                    pauseOnHover
                    className="absolute inset-0 [--duration:15s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]">
                    {Array.from({ length: 5 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="mx-2 flex items-center gap-2 rounded-xl border border-primary/20 bg-muted/30 px-3 py-2">
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
            name: 'Protocol Insights',
            description:
                'Analyze interactions with Solana protocols, DEXes, lending platforms, and yield farms to optimize your DeFi strategy.',
            className: 'col-span-1 sm:col-span-3 lg:col-span-3',
            gradient: 'from-purple-600/20 via-violet-600/20 to-indigo-600/20',
            background: <IntegrationsBackground />,
        },
        {
            Icon: ShieldIcon,
            name: 'Secure Analysis',
            description:
                'Read-only analysis of public blockchain data. No private keys or signatures required.',
            className: 'col-span-1 sm:col-span-3 lg:col-span-1',
            gradient: 'from-purple-600/20 via-violet-600/20 to-indigo-600/20',
            background: (
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <div className="h-32 w-32 animate-pulse rounded-full border-4 border-accent"></div>
                </div>
            ),
        },
        {
            Icon: RocketIcon,
            name: 'Performance Tracking',
            description:
                'Track ROI, gas usage, trading performance, and portfolio value across all Solana tokens and protocols.',
            className: 'col-span-1 sm:col-span-3 lg:col-span-2',
            gradient: 'from-purple-600/20 via-violet-600/20 to-indigo-600/20',
            background: (
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <div className="h-32 w-32 animate-pulse rounded-full border-4 border-accent"></div>
                </div>
            ),
        },
    ];

    return (
        <section ref={ref} className="relative overflow-hidden py-24">
            <div className="absolute inset-0 -z-10">
                <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-500/10 blur-3xl delay-1000" />
                <div className="delay-2000 absolute bottom-1/3 left-1/3 h-96 w-96 animate-pulse rounded-full bg-cyan-500/10 blur-3xl" />
            </div>

            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    className="mb-16 text-center">
                    <Badge
                        variant="outline"
                        className="mb-4 border-purple-500/20">
                        <BrainIcon className="mr-2 h-4 w-4 text-purple-500" />
                        AI-Powered Features
                    </Badge>

                    <h2 className="mt-4 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-4xl font-bold text-transparent">
                        Smart Crypto Analytics
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                        Leverage the power of artificial intelligence for
                        comprehensive portfolio analysis
                    </p>
                </motion.div>

                <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <AIFeatureCard
                        icon={BarChart3Icon}
                        title="Predictive Analytics"
                        description="AI-powered price predictions and trend analysis"
                        gradient="from-purple-600/20 via-pink-600/20 to-red-600/20"
                        delay={0.1}
                    />
                    <AIFeatureCard
                        icon={ActivityIcon}
                        title="Risk Assessment"
                        description="Real-time portfolio risk evaluation and alerts"
                        gradient="from-blue-600/20 via-cyan-600/20 to-teal-600/20"
                        delay={0.2}
                    />
                    <AIFeatureCard
                        icon={RocketIcon}
                        title="Smart Suggestions"
                        description="Personalized investment recommendations"
                        gradient="from-emerald-600/20 via-green-600/20 to-lime-600/20"
                        delay={0.3}
                    />
                </div>

                <motion.div
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: { staggerChildren: 0.1 },
                        },
                    }}
                    initial="hidden"
                    animate={isInView ? 'show' : 'hidden'}>
                    <BentoGrid className="grid-rows-[auto]">
                        {features.map((feature, idx) => (
                            <BentoCard
                                key={idx}
                                name={feature.name}
                                description={feature.description}
                                Icon={feature.Icon}
                                className={cn(
                                    'group relative overflow-hidden rounded-2xl border-0 bg-black/50 p-6 backdrop-blur-xl transition-all hover:shadow-2xl hover:shadow-purple-500/10',
                                    feature.className,
                                )}
                                background={
                                    <>
                                        <div
                                            className={`absolute inset-0 -z-10 bg-gradient-to-br ${feature.gradient} opacity-20 transition-opacity duration-500 group-hover:opacity-30`}
                                        />
                                        {feature.background}
                                    </>
                                }
                            />
                        ))}
                    </BentoGrid>
                </motion.div>
            </div>
        </section>
    );
};

export default Features;
