// // src/lib/analysis/wallet-analyzer.ts
// import { Connection, PublicKey } from '@solana/web3.js';
// import { pipeline } from '@xenova/transformers';
// import * as tf from '@tensorflow/tfjs';
// import { HeliusService } from '../services/helius-service';
// import { RuleBasedAnalyzer } from './rule-based-analyzer';
// import { DetailedMetrics, RiskProfile } from '../types/analytics';
// import { TransactionData, WalletData } from '../types/transaction';

// export class AdvancedWalletAnalyzer {
//     private heliusService: HeliusService;
//     private ruleAnalyzer: RuleBasedAnalyzer;
//     private connection: Connection;

//     constructor(
//         heliusApiKey: string,
//         rpcUrl: string,
//         _modelConfig: any,
//         _marketDataProvider: any
//     ) {
//         this.heliusService = new HeliusService(heliusApiKey);
//         this.ruleAnalyzer = new RuleBasedAnalyzer();
//         this.connection = new Connection(rpcUrl, 'confirmed');
//     }

//     async analyzeWallet(address: string): Promise<DetailedMetrics> {
//         try {
//             const [transactions, balances] = await Promise.all([
//                 this.heliusService.getWalletTransactions(address),
//                 this.heliusService.getWalletBalances(address)
//             ]);

//             console.log({ transactions, balances })

//             // Create a complete DetailedMetrics object
//             const metrics: DetailedMetrics = {
//                 ...this.processCoreMetrics(transactions, balances),
//                 predictionMetrics: {
//                     priceTargets: [],
//                     behaviorPredictions: [],
//                     riskPredictions: []
//                 },
//                 aiInsights: {
//                     summary: "Analysis based on historical trading patterns",
//                     tradingStyle: "Analyzing...",
//                     strengthsWeaknesses: {
//                         strengths: [],
//                         weaknesses: []
//                     },
//                     opportunities: [],
//                     recommendations: [],
//                     marketContext: {
//                         position: "Analysis based on historical data",
//                         sentiment: "Neutral",
//                         keyFactors: []
//                     }
//                 }
//             };

//             // Now analyze with complete metrics
//             const ruleBasedAnalysis = this.ruleAnalyzer.analyze(metrics);

//             // Update the metrics with analysis results
//             return {
//                 ...metrics,
//                 aiInsights: {
//                     summary: "Analysis based on historical trading patterns",
//                     tradingStyle: this.determineTradingStyle(metrics),
//                     strengthsWeaknesses: {
//                         strengths: ruleBasedAnalysis.patterns
//                             .filter(p => p.impact > 0)
//                             .map(p => p.description),
//                         weaknesses: ruleBasedAnalysis.patterns
//                             .filter(p => p.impact < 0)
//                             .map(p => p.description)
//                     },
//                     opportunities: ruleBasedAnalysis.recommendations.map(rec => ({
//                         description: rec.recommendation,
//                         confidence: 0.7,
//                         timeframe: "short-term"
//                     })),
//                     recommendations: ruleBasedAnalysis.recommendations.map(rec => ({
//                         type: 'strategy',
//                         description: rec.recommendation,
//                         priority: rec.priority,
//                         expectedImpact: "medium"
//                     })),
//                     marketContext: {
//                         position: "Analysis based on historical data",
//                         sentiment: this.calculateMarketSentiment(metrics),
//                         keyFactors: this.getKeyFactors(metrics)
//                     }
//                 }
//             };
//         } catch (error) {
//             console.error('Error analyzing wallet:', error);
//             throw new Error('Failed to analyze wallet');
//         }
//     }

//     private processCoreMetrics(transactions: TransactionData[], balances: WalletData): Omit<DetailedMetrics, 'predictionMetrics' | 'aiInsights'> {
//         const swapMetrics = this.processSwaps(transactions);
//         const tokenMetrics = this.processTokens(transactions);
//         const tradeStats = this.calculateTradeStats(transactions);
//         const riskMetrics = this.calculateRiskMetrics(transactions);

//         return {
//             overview: {
//                 totalTransactions: transactions.length,
//                 uniqueTokens: Object.keys(balances.tokenBalances).length,
//                 totalVolume: this.calculateTotalVolume(transactions),
//                 totalFees: this.calculateTotalFees(transactions),
//                 successRate: this.calculateSuccessRate(transactions),
//                 accountAge: this.calculateAccountAge(transactions),
//                 lastActivity: this.getLastActivityTimestamp(transactions),
//                 profitLoss: this.calculateProfitLoss(transactions, balances)
//             },
//             swapMetrics,
//             tokenMetrics,
//             tradingStats: tradeStats,
//             riskMetrics
//         };
//     }

//     private processSwaps(transactions: TransactionData[]) {
//         const swapEvents = transactions.filter(tx => tx.events?.swap);
//         const dexVolumes = this.calculateDexVolumes(swapEvents);
//         const slippageStats = this.calculateSlippageStats(swapEvents);

//         return {
//             totalSwaps: swapEvents.length,
//             swapVolume: this.calculateSwapVolume(swapEvents),
//             averageSwapSize: swapEvents.length > 0 ?
//                 this.calculateSwapVolume(swapEvents) / swapEvents.length : 0,
//             dexDistribution: dexVolumes,
//             slippageStats,
//             timing: this.analyzeSwapTiming(swapEvents)
//         };
//     }

//     private calculateDexVolumes(swapEvents: TransactionData[]) {
//         const dexMap = new Map<string, { volume: number; count: number; avgSlippage: number }>();

//         swapEvents.forEach(tx => {
//             const dex = tx.events?.swap?.innerSwaps?.[0]?.programInfo?.source || 'Unknown';
//             const volume = this.calculateSwapAmount(tx.events?.swap);
//             const slippage = this.calculateSwapSlippage(tx.events?.swap);

//             const current = dexMap.get(dex) || { volume: 0, count: 0, avgSlippage: 0 };
//             current.volume += volume;
//             current.count += 1;
//             current.avgSlippage = (current.avgSlippage * (current.count - 1) + slippage) / current.count;
//             dexMap.set(dex, current);
//         });

//         return Array.from(dexMap.entries())
//             .map(([dex, stats]) => ({
//                 dex,
//                 volume: stats.volume,
//                 count: stats.count,
//                 avgSlippage: stats.avgSlippage
//             }))
//             .sort((a, b) => b.volume - a.volume);
//     }

//     private processTokens(transactions: TransactionData[]) {
//         return transactions
//             .filter(tx => tx.tokenTransfers?.length)
//             .map(tx => ({
//                 symbol: tx.tokenInfo?.symbol || 'Unknown',
//                 mint: tx.tokenInfo?.mint || '',
//                 balance: 0,
//                 volume24h: 0,
//                 priceChange24h: 0,
//                 transactions: 1,
//                 lastActivity: tx.timestamp,
//                 profitLoss: 0,
//                 holdingPeriod: 0,
//                 riskScore: 0
//             }));
//     }

//     private calculateRiskMetrics(transactions: TransactionData[]): RiskProfile & {
//         liquidityExposure: number;
//         impermanentLoss: { current: number; projected: number };
//         protocolExposure: { protocol: string; exposure: number; risk: 'high' | 'medium' | 'low' }[];
//         marketBeta: number;
//         composabilityRisk: number;
//         smartContractRisk: { score: number; factors: string[] };
//     } {
//         return {
//             volatility: 0,
//             drawdown: { max: 0, current: 0, duration: 0 },
//             concentration: { tokenLevel: 0, protocolLevel: 0 },
//             correlation: { marketBeta: 0, sectorCorrelations: [] },
//             var: { daily: 0, weekly: 0, confidence: 0.95 },
//             sharpeRatio: 0,
//             warnings: [],
//             liquidityExposure: 0,
//             impermanentLoss: { current: 0, projected: 0 },
//             protocolExposure: [],
//             marketBeta: 0,
//             composabilityRisk: 0,
//             smartContractRisk: { score: 0, factors: [] }
//         };
//     }

//     // Essential helper methods
//     private calculateTotalVolume(transactions: TransactionData[]): number {
//         return transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
//     }

//     private calculateTotalFees(transactions: TransactionData[]): number {
//         return transactions.reduce((sum, tx) => sum + tx.fee, 0);
//     }

//     private calculateTradeStats(transactions: TransactionData[]) {
//         const profitableTrades = transactions.filter(tx => {
//             const swapEvent = tx.events?.swap;
//             if (!swapEvent) return false;
//             const inputValue = this.calculateTokenValue(swapEvent.tokenInputs?.[0]);
//             const outputValue = this.calculateTokenValue(swapEvent.tokenOutputs?.[0]);
//             return outputValue > inputValue;
//         });

//         const tradingFrequency = this.analyzeTradingFrequency(transactions);
//         const { successiveWins, successiveLosses } = this.analyzeTradeStreaks(transactions);

//         return {
//             profitLoss: this.calculateTotalProfitLoss(transactions),
//             winRate: transactions.length > 0 ? profitableTrades.length / transactions.length : 0,
//             averageReturn: this.calculateAverageReturn(transactions),
//             bestTrade: this.findBestTrade(transactions),
//             worstTrade: this.findWorstTrade(transactions),
//             averageHoldTime: this.calculateAverageHoldTime(transactions),
//             volatility: this.calculateVolatility(transactions),
//             sharpeRatio: this.calculateSharpeRatio(transactions),
//             successiveWins,
//             successiveLosses,
//             tradingFrequency,
//             patterns: this.identifyTradingPatterns(transactions)
//         };
//     }

//     private analyzeTradingFrequency(transactions: TransactionData[]) {
//         // Group transactions by day
//         const dailyStats = new Map<string, {
//             count: number;
//             volume: number;
//             profitLoss: number;
//         }>();

//         transactions.forEach(tx => {
//             const date = new Date(tx.timestamp * 1000).toISOString().split('T')[0];
//             const current = dailyStats.get(date) || { count: 0, volume: 0, profitLoss: 0 };

//             current.count += 1;
//             current.volume += tx.amount || 0;
//             current.profitLoss += this.calculateTransactionProfitLoss(tx);

//             dailyStats.set(date, current);
//         });

//         return Array.from(dailyStats.entries())
//             .map(([date, stats]) => ({
//                 date,
//                 count: stats.count,
//                 volume: stats.volume,
//                 profitLoss: stats.profitLoss
//             }))
//             .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
//     }

//     private calculateTransactionProfitLoss(tx: TransactionData): number {
//         if (tx.events?.swap) {
//             const swapEvent = tx.events.swap;
//             const inputValue = this.calculateTokenValue(swapEvent.tokenInputs?.[0]);
//             const outputValue = this.calculateTokenValue(swapEvent.tokenOutputs?.[0]);
//             return outputValue - inputValue - (tx.fee / 1e9);
//         }
//         return 0;
//     }

//     private calculateTokenValue(token: any): number {
//         if (!token?.rawTokenAmount) return 0;
//         const amount = Number(token.rawTokenAmount.tokenAmount) /
//             Math.pow(10, token.rawTokenAmount.decimals);
//         return amount;
//     }

//     private analyzeTradeStreaks(transactions: TransactionData[]) {
//         let currentWinStreak = 0;
//         let currentLossStreak = 0;
//         let maxWinStreak = 0;
//         let maxLossStreak = 0;

//         transactions.forEach(tx => {
//             const profitLoss = this.calculateTransactionProfitLoss(tx);

//             if (profitLoss > 0) {
//                 currentWinStreak++;
//                 currentLossStreak = 0;
//                 maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
//             } else if (profitLoss < 0) {
//                 currentLossStreak++;
//                 currentWinStreak = 0;
//                 maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
//             }
//         });

//         return {
//             successiveWins: maxWinStreak,
//             successiveLosses: maxLossStreak
//         };
//     }

//     private calculateProfitLoss(transactions: TransactionData[], balances: WalletData) {
//         const realized = transactions.reduce((sum, tx) =>
//             sum + this.calculateTransactionProfitLoss(tx), 0);

//         // For unrealized, we need current token values
//         const unrealized = 0; // Would need current prices to calculate this

//         return {
//             total: realized + unrealized,
//             realized,
//             unrealized
//         };
//     }

//     private calculateSlippageStats(swapEvents: TransactionData[]) {
//         const slippages = swapEvents.map(tx => {
//             const swap = tx.events?.swap;
//             if (!swap) return 0;
//             return this.calculateSwapSlippage(swap);
//         }).filter(s => s > 0);

//         return {
//             average: this.calculateMean(slippages),
//             median: this.calculateMedian(slippages),
//             max: Math.max(...slippages, 0),
//             min: Math.min(...slippages, 0),
//             standardDeviation: this.calculateStandardDeviation(slippages)
//         };
//     }

//     private analyzeSwapTiming(swapEvents: TransactionData[]) {
//         const hourlyStats = new Array(24).fill(0).map(() => ({
//             volume: 0,
//             count: 0
//         }));

//         swapEvents.forEach(tx => {
//             const hour = new Date(tx.timestamp * 1000).getHours();
//             hourlyStats[hour].count++;
//             hourlyStats[hour].volume += tx.amount || 0;
//         });

//         const bestHours = this.findBestTradingHours(hourlyStats);
//         const worstHours = this.findWorstTradingHours(hourlyStats);

//         return {
//             bestHours,
//             worstHours,
//             weekdayDistribution: this.calculateWeekdayDistribution(swapEvents)
//         };
//     }

//     private calculateSwapAmount(swap: any): number {
//         if (!swap) return 0;
//         const inputAmount = this.calculateTokenValue(swap.tokenInputs?.[0]);
//         const outputAmount = this.calculateTokenValue(swap.tokenOutputs?.[0]);
//         return Math.max(inputAmount, outputAmount);
//     }

//     private calculateSwapSlippage(swap: any): number {
//         if (!swap?.tokenInputs?.[0] || !swap?.tokenOutputs?.[0]) return 0;

//         const expectedOutput = this.calculateTokenValue(swap.tokenOutputs[0]);
//         const actualOutput = this.calculateTokenValue(swap.tokenOutputs[0]);

//         if (expectedOutput === 0) return 0;
//         return ((expectedOutput - actualOutput) / expectedOutput) * 100;
//     }

//     private calculateTotalProfitLoss(transactions: TransactionData[]): number {
//         return transactions.reduce((sum, tx) =>
//             sum + this.calculateTransactionProfitLoss(tx), 0);
//     }

//     private calculateAverageReturn(transactions: TransactionData[]): number {
//         const returns = transactions
//             .map(tx => this.calculateTransactionProfitLoss(tx))
//             .filter(r => r !== 0);

//         return returns.length > 0 ? this.calculateMean(returns) : 0;
//     }

//     private findBestTrade(transactions: TransactionData[]): number {
//         return Math.max(...transactions.map(tx =>
//             this.calculateTransactionProfitLoss(tx)), 0);
//     }

//     private findWorstTrade(transactions: TransactionData[]): number {
//         return Math.min(...transactions.map(tx =>
//             this.calculateTransactionProfitLoss(tx)), 0);
//     }

//     private calculateAverageHoldTime(transactions: TransactionData[]): number {
//         const holdTimes = new Map<string, { buyTime: number, sellTime: number }>();

//         transactions.forEach(tx => {
//             if (!tx.tokenInfo?.mint) return;
//             const mint = tx.tokenInfo.mint;
//             const current = holdTimes.get(mint);

//             if (!current) {
//                 holdTimes.set(mint, { buyTime: tx.timestamp, sellTime: tx.timestamp });
//             } else {
//                 current.sellTime = tx.timestamp;
//             }
//         });

//         const times = Array.from(holdTimes.values())
//             .map(({ buyTime, sellTime }) => sellTime - buyTime)
//             .filter(time => time > 0);

//         return times.length > 0 ? this.calculateMean(times) / 3600 : 0; // Convert to hours
//     }

//     private calculateVolatility(transactions: TransactionData[]): number {
//         const returns = transactions
//             .map(tx => this.calculateTransactionProfitLoss(tx))
//             .filter(r => r !== 0);

//         return this.calculateStandardDeviation(returns);
//     }

//     private calculateSharpeRatio(transactions: TransactionData[]): number {
//         const returns = transactions
//             .map(tx => this.calculateTransactionProfitLoss(tx))
//             .filter(r => r !== 0);

//         const averageReturn = this.calculateMean(returns);
//         const volatility = this.calculateStandardDeviation(returns);

//         return volatility === 0 ? 0 : averageReturn / volatility;
//     }

//     private identifyTradingPatterns(transactions: TransactionData[]): any[] {
//         const patterns = [];
//         const hourlyVolumes = this.calculateHourlyVolumes(transactions);
//         const tokenPreferences = this.analyzeTokenPreferences(transactions);

//         // Time-based patterns
//         if (this.hasHighFrequencyTrading(hourlyVolumes)) {
//             patterns.push({
//                 type: 'time',
//                 description: 'High-frequency trading detected',
//                 confidence: 0.8,
//                 significance: 'high'
//             });
//         }

//         // Token-based patterns
//         if (tokenPreferences.hasDominantToken) {
//             patterns.push({
//                 type: 'token',
//                 description: 'Token concentration detected',
//                 confidence: 0.9,
//                 significance: 'high'
//             });
//         }

//         return patterns;
//     }

//     // Helper methods
//     private calculateMean(numbers: number[]): number {
//         return numbers.length === 0 ? 0 :
//             numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
//     }

//     private calculateMedian(numbers: number[]): number {
//         if (numbers.length === 0) return 0;
//         const sorted = [...numbers].sort((a, b) => a - b);
//         const middle = Math.floor(sorted.length / 2);
//         return sorted.length % 2 === 0
//             ? (sorted[middle - 1] + sorted[middle]) / 2
//             : sorted[middle];
//     }

//     private calculateStandardDeviation(numbers: number[]): number {
//         const mean = this.calculateMean(numbers);
//         const squareDiffs = numbers.map(n => Math.pow(n - mean, 2));
//         return Math.sqrt(this.calculateMean(squareDiffs));
//     }

//     private findBestTradingHours(hourlyStats: any[]): number[] {
//         return hourlyStats
//             .map((stats, hour) => ({ hour, volume: stats.volume }))
//             .sort((a, b) => b.volume - a.volume)
//             .slice(0, 3)
//             .map(result => result.hour);
//     }

//     private findWorstTradingHours(hourlyStats: any[]): number[] {
//         return hourlyStats
//             .map((stats, hour) => ({ hour, volume: stats.volume }))
//             .sort((a, b) => a.volume - b.volume)
//             .slice(0, 3)
//             .map(result => result.hour);
//     }

//     private calculateWeekdayDistribution(transactions: TransactionData[]) {
//         const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//         const distribution = days.map(day => ({
//             day,
//             volume: 0,
//             count: 0
//         }));

//         transactions.forEach(tx => {
//             const dayIndex = new Date(tx.timestamp * 1000).getDay();
//             distribution[dayIndex].count++;
//             distribution[dayIndex].volume += tx.amount || 0;
//         });

//         return distribution;
//     }

//     private calculateHourlyVolumes(transactions: TransactionData[]): Map<number, number> {
//         const volumes = new Map<number, number>();

//         transactions.forEach(tx => {
//             const hour = new Date(tx.timestamp * 1000).getHours();
//             volumes.set(hour, (volumes.get(hour) || 0) + (tx.amount || 0));
//         });

//         return volumes;
//     }

//     private analyzeTokenPreferences(transactions: TransactionData[]) {
//         const tokenVolumes = new Map<string, number>();

//         transactions.forEach(tx => {
//             if (!tx.tokenInfo?.mint) return;
//             const mint = tx.tokenInfo.mint;
//             tokenVolumes.set(mint, (tokenVolumes.get(mint) || 0) + (tx.amount || 0));
//         });

//         const volumes = Array.from(tokenVolumes.values());
//         const totalVolume = volumes.reduce((sum, v) => sum + v, 0);
//         const maxVolume = Math.max(...volumes, 0);

//         return {
//             hasDominantToken: maxVolume / totalVolume > 0.5,
//             tokenCount: tokenVolumes.size
//         };
//     }

//     private hasHighFrequencyTrading(hourlyVolumes: Map<number, number>): boolean {
//         const trades = Array.from(hourlyVolumes.values());
//         const averageTradesPerHour = this.calculateMean(trades);
//         return averageTradesPerHour > 5;
//     }

//     private calculateSuccessRate(transactions: TransactionData[]): number {
//         const successful = transactions.filter(tx => tx.status === 'success').length;
//         return transactions.length > 0 ? successful / transactions.length : 0;
//     }

//     private calculateSwapVolume(swapEvents: TransactionData[]): number {
//         return swapEvents.reduce((sum, tx) => sum + (tx.amount || 0), 0);
//     }

//     private calculateAccountAge(transactions: TransactionData[]): number {
//         if (transactions.length === 0) return 0;
//         const firstTx = Math.min(...transactions.map(tx => tx.timestamp));
//         return (Date.now() / 1000 - firstTx) / (24 * 3600);
//     }

//     private getLastActivityTimestamp(transactions: TransactionData[]): number {
//         return transactions.length > 0
//             ? Math.max(...transactions.map(tx => tx.timestamp))
//             : 0;
//     }

//     private determineTradingStyle(metrics: any): string {
//         const tradeCount = metrics.overview.totalTransactions;
//         if (tradeCount > 100) return 'Active Trader';
//         if (tradeCount > 50) return 'Regular Trader';
//         return 'Casual Trader';
//     }

//     private calculateMarketSentiment(metrics: any): string {
//         return 'Neutral';
//     }

//     private getKeyFactors(metrics: any): string[] {
//         return [
//             `${metrics.overview.totalTransactions} total transactions`,
//             `${metrics.overview.uniqueTokens} unique tokens traded`
//         ];
//     }
// }