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

const navItems = [
  { label: 'Github', href: 'https://github.com/d-a-ve', icon: GitHubLogoIcon },
];

const Header = ({ handleLogin }: { handleLogin: () => void }) => {
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

const StatsCard = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-center rounded-xl border bg-card/50 p-4 backdrop-blur-sm">
    <h3 className="text-3xl font-bold text-primary">{value}</h3>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

const Hero = ({ handleLogin }: { handleLogin: () => void }) => {
  const productRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: productRef,
    offset: ['start end', 'end start'],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5], [30, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.6, 1]);

  return (
    <section className="relative pt-[5.75rem]" ref={productRef}>
      {/* AI Glow Effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-96 w-96 animate-pulse rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-screen-xl px-6 pb-6 pt-12 md:pb-8 md:pt-16">
        <div className="mx-auto max-w-3xl">
          <BlurFade delay={0.3} className="pointer-events-none select-none">
            <div className="mb-6 flex items-center justify-center gap-2">
              <SparklesIcon className="h-5 w-5 text-primary" />
              <span className="rounded-full border border-primary/20 bg-muted/80 px-4 py-1.5 text-sm font-medium text-primary shadow-lg backdrop-blur-sm">
                Powered by Advanced AI
              </span>
              <SparklesIcon className="h-5 w-5 text-primary" />
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Your{' '}
              <AnimatedShinyText className="inline">
                <span>AI-Powered</span>
              </AnimatedShinyText>{' '}
              <br />
              Crypto Analytics Platform
            </h1>

            <p className="mt-4 text-lg text-muted-foreground">
              Harness the power of artificial intelligence to analyze your
              portfolio, predict trends, and optimize your crypto investments
            </p>
          </BlurFade>

          <BlurFade delay={0.4}>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <RainbowButton
                onClick={handleLogin}
                className="h-12 min-w-[200px] text-base transition-all duration-300 hover:scale-105"
              >
                <WalletIcon className="mr-2 h-4 w-4" />
                Connect Wallet
              </RainbowButton>
              <Button
                variant="outline"
                className="h-12 min-w-[200px] gap-2 text-base"
              >
                Watch Demo
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </BlurFade>

          {/* Stats Section */}
          <BlurFade delay={0.5}>
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatsCard label="Active Users" value="10K+" />
              <StatsCard label="Transactions Analyzed" value="1M+" />
              <StatsCard label="AI Predictions" value="99%" />
              <StatsCard label="Portfolio Growth" value="47%" />
            </div>
          </BlurFade>
        </div>
      </div>

      {/* Enhanced Product Preview */}
      <div className="relative w-full">
        <BlurFade delay={0.6} className="mx-auto max-w-screen-2xl px-6">
          <div className="relative">
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{
                rotateX,
                scale,
                opacity,
                transformPerspective: 1000,
              }}
              className="relative mx-auto w-full max-w-[1200px] will-change-transform"
            >
              <div className="group relative overflow-hidden rounded-2xl border bg-card shadow-2xl">
                <div className="relative dark:hidden">
                  <Image
                    src="/product.png"
                    alt="AI Analytics Dashboard"
                    width={1200}
                    height={675}
                    className="w-full rounded-2xl"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>
                <div className="relative hidden dark:block">
                  <Image
                    src="/product_dark.png"
                    alt="AI Analytics Dashboard"
                    width={1200}
                    height={675}
                    className="w-full rounded-2xl"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>
                <BorderBeam
                  className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  duration={10}
                  size={300}
                />
              </div>
            </motion.div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
};

// Enhanced features array
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
              {idx % 2 === 0 ? 'Live Analytics' : 'Real-time Insights'}
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

const AIFeatureCard = ({ title, description, icon: Icon }: AIFeatureCardProps) => (
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
    <>
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
              Leverage the power of artificial intelligence for comprehensive
              portfolio analysis
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
    </>
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
    <div className="flex flex-col">
      <AiParticlesBackground />
      <Header handleLogin={login} />
      <main className="flex-1">
        <Hero handleLogin={login} />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
