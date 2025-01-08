import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from 'lucide-react';
import type { AnalysisResponse, TransactionData } from '@/app/api/analyze/route';

interface Transaction {
    blockTime: number;
    meta: {
        postBalances: number[];
        preBalances: number[];
        err: any;
    };
}

interface TradingAnalysisProps {
    transactions: Transaction[];
    address: string;
}

const TradingAnalysis: React.FC<TradingAnalysisProps> = ({ transactions, address }) => {
    console.log("analyzing trades")
    const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const analyzeTrades = async (transactions: Transaction[]): Promise<AnalysisResponse | null> => {
        if (!transactions || transactions.length === 0) return null;

        // Format transaction data for GPT analysis
        const formattedTxns: TransactionData[] = transactions.slice(0, 30).map(tx => ({
            time: new Date(tx.blockTime * 1000).toLocaleString(),
            amount: (tx.meta.postBalances[0] - tx.meta.preBalances[0]) / 1e9,
            status: tx.meta.err === null ? "Success" : "Failed"
        }));

        // Create prompt for analysis
        const prompt = `You are an expert crypto trading analyst. Analyze these Solana wallet transactions and identify potential trading mistakes and provide solutions. Focus on:
    1. Pattern of frequent small losses
    2. Large individual losses
    3. Poor timing (e.g. selling during dips)
    4. Risk management issues
    5. Gas fee optimization
    6. Transaction frequency and timing
    7. Failed transaction patterns
    
    Here are the last ${formattedTxns.length} transactions for analysis:
    ${JSON.stringify(formattedTxns, null, 2)}
    
    Provide your analysis in this exact JSON format:
    {
      "patterns": [Array of identified patterns as strings],
      "majorIssues": [Array of major issues found as strings],
      "recommendations": [Array of specific, actionable recommendations as strings],
      "riskScore": A number from 1-10 indicating overall risk level of trading behavior
    }
    
    Focus on providing specific, actionable insights. Include specific numbers and percentages where relevant.`;

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: "You are a crypto trading expert analyst who specializes in analyzing Solana blockchain transactions and providing actionable trading advice."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    response_format: { type: "json_object" }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to analyze transactions');
            }

            const data = await response.json();
            console.log("data from open ai", data)
            return JSON.parse(data.choices[0].message.content) as AnalysisResponse;
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error analyzing trades:', error);
                setError(error.message);
            }
            return null;
        }
    };

    useEffect(() => {
        const analyze = async () => {
            setLoading(true);
            setError(null);
            const result = await analyzeTrades(transactions);
            setAnalysis(result);
            setLoading(false);
        };

        if (transactions && transactions.length > 0) {
            analyze();
        }
    }, [transactions]);

    const getRiskColor = (score: number): string => {
        if (score <= 3) return 'bg-green-950 text-green-200';
        if (score <= 6) return 'bg-yellow-950 text-yellow-200';
        return 'bg-red-950 text-red-200';
    };

    if (loading) {
        return (
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-200">
                        Trading Analysis
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-200">Analyzing Patterns</h3>
                        <div className="space-y-3">
                            <Skeleton className="h-20 w-full bg-gray-800" />
                            <Skeleton className="h-20 w-full bg-gray-800" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-200">Identifying Issues</h3>
                        <div className="space-y-3">
                            <Skeleton className="h-20 w-full bg-gray-800" />
                            <Skeleton className="h-20 w-full bg-gray-800" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-200">Generating Recommendations</h3>
                        <div className="space-y-3">
                            <Skeleton className="h-20 w-full bg-gray-800" />
                            <Skeleton className="h-20 w-full bg-gray-800" />
                            <Skeleton className="h-20 w-full bg-gray-800" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="text-gray-200">Trading Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive" className="border-red-900 bg-red-950">
                        <AlertTitle className="text-red-200">Error</AlertTitle>
                        <AlertDescription className="text-red-200">
                            Failed to analyze transactions: {error}
                            <br />
                            Please try again later.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (!analysis) return null;

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-200">
                    <span>Trading Analysis</span>
                    <span className={`text-sm px-3 py-1 rounded-full ${getRiskColor(analysis.riskScore)}`}>
                        Risk Score: {analysis.riskScore}/10
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-200">Identified Patterns</h3>
                    {analysis.patterns.map((pattern, index) => (
                        <Alert key={index} className="mb-2 border-blue-900 bg-blue-950">
                            <AlertTitle className="text-blue-200">Pattern {index + 1}</AlertTitle>
                            <AlertDescription className="text-blue-200">{pattern}</AlertDescription>
                        </Alert>
                    ))}
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-200">Major Issues</h3>
                    {analysis.majorIssues.map((issue, index) => (
                        <Alert key={index} className="mb-2 border-red-900 bg-red-950">
                            <AlertTitle className="text-red-200">Issue {index + 1}</AlertTitle>
                            <AlertDescription className="text-red-200">{issue}</AlertDescription>
                        </Alert>
                    ))}
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-200">Recommendations</h3>
                    {analysis.recommendations.map((recommendation, index) => (
                        <Alert key={index} className={`mb-2 border-green-900 ${getRiskColor(analysis.riskScore)}`}>
                            <AlertTitle className="text-green-200">Recommendation {index + 1}</AlertTitle>
                            <AlertDescription className="text-green-200">{recommendation}</AlertDescription>
                        </Alert>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default TradingAnalysis;