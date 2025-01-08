import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { BrainIcon, SparklesIcon } from 'lucide-react';

import { BorderBeam } from '@/components/ui/border-beam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TradingAnalysisProps {
    transactions: any[];
    address: string;
}

// Typing animation component
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
            }, 20); // Adjust typing speed here

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
}) => {
    const [isHovered, setIsHovered] = useState(false);

    // AI analysis prompt template
    const generateAnalysis = () => {
        const totalTransactions = transactions.length;
        const timeSpan =
            transactions.length > 0
                ? Math.ceil(
                      (Date.now() / 1000 - transactions[0].blockTime) /
                          (24 * 60 * 60),
                  )
                : 0;

        // Analysis sections with more natural language
        const insights = [
            {
                title: 'Transaction Overview',
                content: `This wallet has conducted ${totalTransactions} transactions in the past ${timeSpan} days, showing ${totalTransactions > 10 ? 'active' : 'moderate'} engagement with the Solana ecosystem.`,
            },
            {
                title: 'Trading Patterns',
                content: `Based on the transaction history, this wallet exhibits ${
                    totalTransactions > 20
                        ? 'frequent trading behavior'
                        : 'occasional trading activity'
                }. The transaction patterns suggest a ${
                    totalTransactions > 15 ? 'sophisticated' : 'cautious'
                } approach to portfolio management.`,
            },
            {
                title: 'Risk Assessment',
                content: `The wallet's trading behavior indicates a ${
                    totalTransactions > 25 ? 'high' : 'moderate'
                } risk tolerance. ${
                    totalTransactions > 20
                        ? 'Regular interaction with DeFi protocols suggests familiarity with advanced trading strategies.'
                        : 'The transaction pattern shows a measured approach to cryptocurrency investments.'
                }`,
            },
            {
                title: 'Strategic Recommendations',
                content: `Consider ${
                    totalTransactions < 10
                        ? 'exploring more DeFi opportunities while maintaining your careful approach'
                        : 'implementing stop-loss strategies to protect your active trading positions'
                }. ${
                    timeSpan > 30
                        ? 'Your long-term holding strategy appears effective.'
                        : 'Consider extending your investment timeframe for better returns.'
                }`,
            },
        ];

        return insights;
    };

    const analysis = generateAnalysis();

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
                    {analysis.map((section, index) => (
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
