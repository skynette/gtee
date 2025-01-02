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
  ChartBarIcon,
  RocketIcon,
  ShieldIcon,
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
      <div className="relative mx-auto max-w-screen-xl px-6 pb-6 pt-12 text-center md:pb-8 md:pt-16">
        <div className="mx-auto max-w-3xl">
          <BlurFade delay={0.3} className="pointer-events-none select-none">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-muted/80 px-4 py-1.5 shadow-lg backdrop-blur-sm">
              <span className="text-sm font-medium text-primary">
                🚀 AI-Powered Crypto Analytics
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Your{' '}
              <AnimatedShinyText className="inline">
                <span>Personal AI Advisor</span>
              </AnimatedShinyText>{' '}
              for <span>Crypto</span>
            </h1>

            <p className="mt-4 text-lg text-muted-foreground">
              Get detailed metrics and AI-driven investment insights based on
              your wallet&apos;s transaction history
            </p>
          </BlurFade>

          <BlurFade delay={0.4}>
            <div className="mt-8">
              <RainbowButton
                onClick={handleLogin}
                className="h-12 min-w-[180px] text-base transition-all duration-300 hover:scale-105"
              >
                Connect Your Wallet
              </RainbowButton>
            </div>
          </BlurFade>
        </div>
      </div>
      <div className="relative w-full">
        <BlurFade delay={0.6} className="mx-auto max-w-screen-2xl px-6">
          <div className="relative">
            {/* Product images */}
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{
                rotateX,
                scale,
                opacity,
                transformPerspective: 1000,
              }}
              transition={{
                type: 'spring',
                stiffness: 50,
                damping: 20,
                delay: 0.5,
              }}
              className="relative mx-auto w-full max-w-[1200px] will-change-transform"
            >
              <div className="group relative overflow-hidden rounded-2xl border bg-card shadow-2xl">
                {/* Light mode image */}
                <div className="relative dark:hidden">
                  <Image
                    src="/product.png"
                    alt="Neur AI Interface"
                    width={1200}
                    height={675}
                    className="w-full rounded-2xl"
                    priority
                  />
                </div>
                {/* Dark mode image */}
                <div className="relative hidden dark:block">
                  <Image
                    src="/product_dark.png"
                    alt="Neur AI Interface"
                    width={1200}
                    height={675}
                    className="w-full rounded-2xl"
                    priority
                  />
                </div>
                <BorderBeam
                  className="opacity-0 group-hover:opacity-100"
                  duration={10}
                  size={300}
                />
              </div>

              {/* Decorative elements */}
              <div className="absolute -left-4 -top-4 h-72 w-72 animate-blob rounded-full bg-primary/5 mix-blend-multiply blur-xl" />
              <div className="animation-delay-2000 absolute -right-4 -top-4 h-72 w-72 animate-blob rounded-full bg-secondary/5 mix-blend-multiply blur-xl" />
            </motion.div>
          </div>
        </BlurFade>
      </div>{' '}
    </section>
  );
};

const features = [
  {
    Icon: WalletIcon,
    name: 'Smart Wallet Analysis',
    description:
      'Connect your crypto wallet to receive comprehensive transaction analysis, portfolio tracking, and performance metrics powered by advanced AI algorithms.',
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

const Features = () => {
  return (
    <BlurFade delay={0.5} className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-3 text-2xl font-bold tracking-tight sm:mb-4 sm:text-4xl">
            Smart Crypto Analytics
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Powered by advanced AI for detailed wallet insights and investment
            recommendations
          </p>
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
        <p>© 2024 CryptoMetrics AI. All rights reserved.</p>
        <span>|</span>
        <Link
          href="https://x.com/cryptometrics"
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
