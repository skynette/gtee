import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { BrainIcon, SparklesIcon } from 'lucide-react';

import { BorderBeam } from '@/components/ui/border-beam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TradingAnalysisProps {
    transactions: any[];
    address: string;
    tokens?: any[];
}

interface AnalysisResponse {
    portfolioOverview: string;
    tradingBehavior: string;
    riskProfile: string;
    marketEngagement: string;
    recommendations: string;
}
interface TypewriterTextProps {
    text: string;
    delay?: number;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text, delay = 0 }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let currentText = '';
        let currentIndex = 0;

        setTimeout(() => {
            const interval = setInterval(() => {
                if (currentIndex < text.length) {
                    currentText += text[currentIndex];
                    setDisplayedText(currentText);
                    currentIndex++;
                } else {
                    clearInterval(interval);
                    setIsComplete(true);
                }
            }, 20);

            return () => clearInterval(interval);
        }, delay);
    }, [text, delay]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${isComplete ? 'after:hidden' : 'after:animate-blink after:ml-1 after:content-["▋"]'}`}>
            {displayedText}
        </motion.div>
    );
};

const TradingAnalysis: React.FC<TradingAnalysisProps> = ({
    transactions,
    address,
    tokens = [],
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        transactions,
                        tokens,
                        address,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch analysis');
                }

                const data = await response.json();
                setAnalysis(data);
            } catch (err) {
                console.error('Error fetching analysis:', err);
                setError('Failed to generate analysis');
            } finally {
                setIsLoading(false);
            }
        };

        if (transactions.length > 0) {
            fetchAnalysis();
        }
    }, [transactions, tokens, address]);

    if (error) {
        return (
            <Card className="relative overflow-hidden">
                <CardContent className="p-6 text-red-500">{error}</CardContent>
            </Card>
        );
    }

    if (isLoading || !analysis) {
        return (
            <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                        <BrainIcon className="h-6 w-6 animate-pulse text-primary" />
                        <span className="text-sm">
                            Generating AI analysis...
                        </span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const insights = [
        { title: 'Portfolio Overview', content: analysis.portfolioOverview },
        {
            title: 'Trading Behavior Analysis',
            content: analysis.tradingBehavior,
        },
        { title: 'Risk Profile & Strategy', content: analysis.riskProfile },
        { title: 'Market Engagement', content: analysis.marketEngagement },
        {
            title: 'Strategic Recommendations',
            content: analysis.recommendations,
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <Card className="relative overflow-hidden">
                {isHovered && (
                    <BorderBeam
                        size={400}
                        duration={15}
                        colorFrom="#4f46e5"
                        colorTo="#8b5cf6"
                        borderWidth={1.5}
                    />
                )}
                <CardHeader className="relative">
                    <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        onHoverStart={() => setIsHovered(true)}
                        onHoverEnd={() => setIsHovered(false)}>
                        <BrainIcon className="h-6 w-6 animate-pulse text-primary" />
                        <CardTitle className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
                            AI Trading Analysis
                        </CardTitle>
                        <SparklesIcon className="h-6 w-6 animate-pulse text-primary" />
                    </motion.div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {insights.map((section, index) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className="relative rounded-lg border border-primary/10 bg-card/50 p-4 backdrop-blur-sm">
                            <h3 className="mb-2 font-semibold text-primary">
                                <TypewriterText
                                    text={section.title}
                                    delay={index * 1000}
                                />
                            </h3>
                            <div className="text-sm text-muted-foreground">
                                <TypewriterText
                                    text={section.content}
                                    delay={index * 1000 + 500}
                                />
                            </div>
                        </motion.div>
                    ))}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default TradingAnalysis;
