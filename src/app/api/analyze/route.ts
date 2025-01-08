// app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Fallback analysis function
const generateFallbackAnalysis = (data: any) => {
    const {
        totalTransactions,
        timeSpan,
        transactionVolumes,
        uniqueTokens,
        tradingTimes,
        tokens
    } = data;

    // Advanced metrics calculations
    const avgVolume = transactionVolumes.reduce((a: number, b: number) => a + b, 0) / transactionVolumes.length;
    const txPerDay = timeSpan > 0 ? totalTransactions / timeSpan : 0;
    const maxVolume = Math.max(...transactionVolumes);
    const minVolume = Math.min(...transactionVolumes);
    const volumeVariance = transactionVolumes.reduce((acc: number, val: number) => acc + Math.pow(val - avgVolume, 2), 0) / transactionVolumes.length;
    const volatility = Math.sqrt(volumeVariance);

    // Trading time analysis
    const tradingHoursDistribution = tradingTimes.reduce((acc: { [key: number]: number }, hour: number) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
    }, {});
    const mostActiveHour = Object.entries(tradingHoursDistribution)
        .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0];

    // Transaction pattern analysis
    const recentTxCount = transactionVolumes.slice(-Math.min(10, transactionVolumes.length)).length;
    const recentAvgVolume = transactionVolumes.slice(-Math.min(10, transactionVolumes.length))
        .reduce((a: any, b: any) => a + b, 0) / recentTxCount;
    const volumeTrend = recentAvgVolume > avgVolume ? 'increasing' : 'decreasing';

    // Risk metrics
    const riskScore = calculateRiskScore({
        txFrequency: txPerDay,
        volumeVolatility: volatility,
        tokenDiversity: uniqueTokens,
        avgVolume
    });

    // Generate insights
    const portfolioOverview = generatePortfolioOverview({
        uniqueTokens,
        totalTransactions,
        timeSpan,
        txPerDay,
        avgVolume
    });

    const tradingBehavior = generateTradingBehavior({
        avgVolume,
        txPerDay,
        mostActiveHour: Number(mostActiveHour),
        volumeTrend,
        volatility,
        maxVolume
    });

    const riskProfile = generateRiskProfile({
        riskScore,
        uniqueTokens,
        txPerDay,
        volatility,
        volumeVariance
    });

    const marketEngagement = generateMarketEngagement({
        totalTransactions,
        timeSpan,
        recentTxCount,
        volumeTrend,
        txPerDay
    });

    const recommendations = generateRecommendations({
        riskScore,
        txPerDay,
        uniqueTokens,
        avgVolume,
        volatility,
        volumeTrend
    });

    return {
        portfolioOverview,
        tradingBehavior,
        riskProfile,
        marketEngagement,
        recommendations
    };
};

// Helper functions for more nuanced analysis
const calculateRiskScore = ({
    txFrequency,
    volumeVolatility,
    tokenDiversity,
    avgVolume
}: {
    txFrequency: number;
    volumeVolatility: number;
    tokenDiversity: number;
    avgVolume: number;
}) => {
    const frequencyScore = Math.min(txFrequency / 5, 1) * 0.3;
    const volatilityScore = Math.min(volumeVolatility / 100, 1) * 0.3;
    const diversityScore = Math.min(tokenDiversity / 10, 1) * 0.2;
    const volumeScore = Math.min(avgVolume / 100, 1) * 0.2;

    return (frequencyScore + volatilityScore + diversityScore + volumeScore) * 100;
};

const generatePortfolioOverview = ({ uniqueTokens, totalTransactions, timeSpan, txPerDay, avgVolume }: any) => {
    const diversificationLevel = uniqueTokens > 10 ? 'highly diversified' :
        uniqueTokens > 5 ? 'well-diversified' :
            uniqueTokens > 3 ? 'moderately concentrated' : 'highly concentrated';

    const activityLevel = txPerDay > 5 ? 'very active' :
        txPerDay > 2 ? 'active' :
            txPerDay > 0.5 ? 'moderate' : 'passive';

    return `This wallet exhibits a ${diversificationLevel} portfolio with ${uniqueTokens} unique tokens, demonstrating ${uniqueTokens > 5 ? 'a sophisticated approach to risk management' : 'a focused investment strategy'
        }. Over the past ${timeSpan} days, the account has executed ${totalTransactions} transactions, maintaining ${activityLevel
        } trading engagement with an average volume of ${avgVolume.toFixed(2)} SOL per transaction. ${txPerDay > 2
            ? 'The high transaction frequency suggests an actively managed portfolio with regular rebalancing.'
            : 'The measured transaction frequency indicates a methodical, long-term investment approach.'
        }`;
};

const generateTradingBehavior = ({ avgVolume, txPerDay, mostActiveHour, volumeTrend, volatility, maxVolume }: any) => {
    const tradingStyle = txPerDay > 5 ? 'day trading' :
        txPerDay > 2 ? 'active trading' :
            txPerDay > 0.5 ? 'swing trading' : 'position trading';

    const timeContext = mostActiveHour >= 12 && mostActiveHour <= 20
        ? 'during peak market hours'
        : mostActiveHour >= 0 && mostActiveHour < 8
            ? 'during Asian market hours'
            : 'during off-peak hours';

    return `The wallet demonstrates a ${tradingStyle} pattern, most active ${timeContext} (${mostActiveHour}:00 UTC). ${volumeTrend === 'increasing'
        ? 'Recent trading volumes show an upward trend, suggesting growing market confidence'
        : 'Recent trading volumes indicate a more cautious approach'
        }. With an average transaction size of ${avgVolume.toFixed(2)} SOL and peak volumes reaching ${maxVolume.toFixed(2)} SOL, ${volatility > 50
            ? 'the trading pattern shows significant volatility, indicating opportunistic trading behavior'
            : 'the consistent transaction sizes suggest a disciplined execution strategy'
        }.`;
};

const generateRiskProfile = ({ riskScore, uniqueTokens, txPerDay, volatility, volumeVariance }: any) => {
    const riskLevel = riskScore > 75 ? 'aggressive' :
        riskScore > 50 ? 'moderate-to-high' :
            riskScore > 25 ? 'moderate' : 'conservative';

    return `The wallet's trading behavior indicates a ${riskLevel} risk profile (${riskScore.toFixed(0)}/100), characterized by ${uniqueTokens > 5 ? 'diversified holdings across multiple tokens' : 'concentrated positions in select tokens'
        }. ${txPerDay > 2
            ? 'The high trading frequency suggests active risk management and market timing strategies.'
            : 'The measured trading approach indicates a focus on risk mitigation through careful position sizing.'
        } Transaction volatility metrics (σ=${volatility.toFixed(2)}) ${volatility > 50
            ? 'signal comfort with market fluctuations'
            : 'suggest a preference for stable, predictable trading patterns'
        }.`;
};

const generateMarketEngagement = ({ totalTransactions, timeSpan, recentTxCount, volumeTrend, txPerDay }: any) => {
    const engagementLevel = txPerDay > 5 ? 'deeply embedded' :
        txPerDay > 2 ? 'actively engaged' :
            txPerDay > 0.5 ? 'regularly participating' : 'selectively involved';

    const recentActivity = recentTxCount > txPerDay * 2
        ? 'increasing market participation'
        : recentTxCount < txPerDay / 2
            ? 'reducing market exposure'
            : 'maintaining consistent engagement';

    return `This wallet is ${engagementLevel} in the Solana ecosystem, with ${totalTransactions} transactions across ${timeSpan} days. ${volumeTrend === 'increasing'
        ? 'Recent activity shows escalating market involvement'
        : 'Current trading patterns indicate strategic position management'
        }. ${timeSpan > 30
            ? 'The extended trading history demonstrates sustained ecosystem participation and deep market understanding.'
            : 'The recent trading history suggests an emerging market presence with evolving strategy development.'
        } The analysis indicates ${recentActivity} in the current market conditions.`;
};

const generateRecommendations = ({ riskScore, txPerDay, uniqueTokens, avgVolume, volatility, volumeTrend }: any) => {
    const recommendations = [];

    if (riskScore > 75) {
        recommendations.push("Consider implementing stricter risk management protocols given the aggressive trading profile");
    } else if (riskScore < 25) {
        recommendations.push("Explore opportunities to optimize returns through calculated risk exposure");
    }

    if (uniqueTokens < 5) {
        recommendations.push("Evaluate portfolio diversification opportunities to enhance risk-adjusted returns");
    } else if (uniqueTokens > 15) {
        recommendations.push("Consider consolidating positions to optimize portfolio efficiency");
    }

    if (volatility > 50 && volumeTrend === 'increasing') {
        recommendations.push("Implement position sizing rules to manage increased volatility exposure");
    }

    if (txPerDay > 5) {
        recommendations.push("Review trading frequency to optimize gas costs and execution efficiency");
    }

    if (avgVolume > 100) {
        recommendations.push("Consider implementing staged entries and exits for large positions");
    }

    return `Based on the comprehensive analysis, consider: ${recommendations.slice(0, 3).join('; ')}.`;
};

const tryOpenAIAnalysis = async (formattedData: any) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-16k",
            messages: [
                {
                    role: "system",
                    content: "You are an AI analyzing Solana wallet trading patterns. Provide detailed insights in a specific JSON format."
                },
                {
                    role: "user",
                    content: `Analyze this Solana wallet data and provide insights. Format the response as JSON with the exact keys: portfolioOverview, tradingBehavior, riskProfile, marketEngagement, and recommendations.

                    Wallet Data:
                    - Total Transactions: ${formattedData.totalTransactions}
                    - Time Period: ${formattedData.timeSpan} days
                    - Average Volume: ${formattedData.transactionVolumes.reduce((a: any, b: any) => a + b, 0) / formattedData.transactionVolumes.length} SOL
                    - Unique Tokens: ${formattedData.uniqueTokens}
                    `
                }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        if (content) {
            return JSON.parse(content);
        } else {
            throw new Error('OpenAI response content is null');
        }
    } catch (error) {
        console.error('OpenAI Analysis failed:', error);
        throw error;
    }
};

const tryGeminiAnalysis = async (formattedData: any) => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analyze this Solana wallet data and provide insights formatted as JSON:
    {
        "portfolioOverview": "<analysis of portfolio composition>",
        "tradingBehavior": "<analysis of trading patterns>",
        "riskProfile": "<risk assessment>",
        "marketEngagement": "<ecosystem engagement analysis>",
        "recommendations": "<strategic recommendations>"
    }

    Data:
    - Total Transactions: ${formattedData.totalTransactions}
    - Time Period: ${formattedData.timeSpan} days
    - Average Volume: ${formattedData.transactionVolumes.reduce((a: any, b: any) => a + b, 0) / formattedData.transactionVolumes.length} SOL
    - Unique Tokens: ${formattedData.uniqueTokens}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    console.log({ analysisText })

    return JSON.parse(analysisText.replace(/```json\n?|\n?```/g, ''));
};

export async function POST(request: Request) {
    try {
        const { transactions, tokens, address } = await request.json();

        // Format data
        const formattedData = {
            totalTransactions: transactions.length,
            timeSpan: transactions.length > 0
                ? Math.ceil((Date.now() / 1000 - transactions[0].blockTime) / (24 * 60 * 60))
                : 0,
            transactionVolumes: transactions.map((tx: { meta: { preBalances: any[]; postBalances: any[]; }; }) => {
                const preBalance = tx.meta.preBalances[0];
                const postBalance = tx.meta.postBalances[0];
                return Math.abs(postBalance - preBalance) / 1e9;
            }),
            uniqueTokens: new Set(tokens.map((token: any) => token.mint)).size,
            tradingTimes: transactions.map((tx: { blockTime: number; }) =>
                new Date(tx.blockTime * 1000).getUTCHours()
            ),
            tokens: tokens.map((token: any) => ({
                mint: token.mint,
                amount: token.amount,
            }))
        };

        try {
            // Try Gemini first
            console.log('Attempting Gemini analysis...');
            const geminiAnalysis = await tryGeminiAnalysis(formattedData);
            return NextResponse.json(geminiAnalysis);
        } catch (geminiError) {
            console.log('Gemini failed, trying OpenAI...', geminiError);
            return NextResponse.json({ error: 'Gemini failed' });
            // try {
            //     // Try OpenAI as backup
            //     const openAIAnalysis = await tryOpenAIAnalysis(formattedData);
            //     return NextResponse.json(openAIAnalysis);
            // } catch (openAIError) {
            //     console.log('OpenAI failed, using fallback...');

            //     // Use fallback if both AI services fail
            //     const fallbackAnalysis = generateFallbackAnalysis(formattedData);
            //     return NextResponse.json(fallbackAnalysis);
            // }
        }
    } catch (error: any) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze transactions' },
            { status: 500 }
        );
    }
}