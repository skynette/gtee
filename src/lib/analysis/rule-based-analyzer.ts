// src/lib/analysis/enhanced-rule-analyzer.ts
import { DetailedMetrics, TradingPattern, RiskProfile } from '../types/analytics';

interface AdvancedRule {
    id: string;
    name: string;
    description: string;
    category: 'pattern' | 'risk' | 'opportunity' | 'performance';
    condition: (metrics: DetailedMetrics) => boolean;
    impact: (metrics: DetailedMetrics) => number;
    confidence: (metrics: DetailedMetrics) => number;
    recommendations: (metrics: DetailedMetrics) => string[];
    priority: number;
    dependencies?: string[]; // IDs of other rules that should be evaluated first
}

export class RuleBasedAnalyzer {
    private rules: AdvancedRule[];
    private ruleCache: Map<string, boolean>;
    private metricsSnapshot: DetailedMetrics | null = null;

    constructor() {
        this.rules = this.initializeRules();
        this.ruleCache = new Map();
    }

    private initializeRules(): AdvancedRule[] {
        return [
            // Trading Pattern Rules
            {
                id: 'high-frequency-trading',
                name: 'High-Frequency Trading Pattern',
                description: 'Identifies high-frequency trading behavior',
                category: 'pattern',
                condition: (m) => {
                    const avgTradesPerDay = m.tradingStats.tradingFrequency
                        .reduce((sum, tf) => sum + tf.count, 0) /
                        m.tradingStats.tradingFrequency.length;
                    return avgTradesPerDay > 10;
                },
                impact: (m) => {
                    const successRate = m.tradingStats.winRate;
                    return successRate > 0.6 ? 1 : -1;
                },
                confidence: (m) => {
                    const sampleSize = m.overview.totalTransactions;
                    return Math.min(sampleSize / 1000, 0.95);
                },
                recommendations: (m) => [
                    'Consider transaction costs impact on strategy',
                    'Implement advanced execution algorithms',
                    'Monitor slippage across different DEXs'
                ],
                priority: 1
            },

            // Portfolio Concentration Rules
            {
                id: 'token-concentration',
                name: 'Token Concentration Risk',
                description: 'Analyzes portfolio concentration risk',
                category: 'risk',
                condition: (m) => {
                    const topTokenShare = m.tokenMetrics
                        .sort((a, b) => b.balance - a.balance)[0]?.balance || 0;
                    return topTokenShare > 0.4; // 40% in single token
                },
                impact: (m) => -0.8,
                confidence: (m) => 0.9,
                recommendations: (m) => [
                    'Consider diversifying token holdings',
                    'Set maximum allocation limits per token',
                    'Review portfolio rebalancing strategy'
                ],
                priority: 1
            },

            // Market Timing Rules
            {
                id: 'market-timing',
                name: 'Market Timing Analysis',
                description: 'Evaluates market timing effectiveness',
                category: 'performance',
                condition: (m) => {
                    const profitableTrades = m.tradingStats.tradingFrequency
                        .filter(tf => tf.profitLoss > 0).length;
                    return profitableTrades / m.tradingStats.tradingFrequency.length > 0.6;
                },
                impact: (m) => 0.7,
                confidence: (m) => {
                    const sampleSize = m.tradingStats.tradingFrequency.length;
                    return Math.min(sampleSize / 100, 0.85);
                },
                recommendations: (m) => [
                    'Continue monitoring successful timing patterns',
                    'Consider automating entry/exit strategies',
                    'Document market conditions for successful trades'
                ],
                priority: 2
            },

            // Liquidity Risk Rules
            {
                id: 'liquidity-risk',
                name: 'Liquidity Risk Assessment',
                description: 'Analyzes exposure to liquidity risks',
                category: 'risk',
                condition: (m) => m.riskMetrics.liquidityExposure > 0.3,
                impact: (m) => -0.6,
                confidence: (m) => 0.85,
                recommendations: (m) => [
                    'Consider reducing position sizes in illiquid tokens',
                    'Implement sliding slippage tolerance',
                    'Monitor DEX liquidity trends'
                ],
                priority: 1,
                dependencies: ['token-concentration']
            },

            // Smart Contract Risk Rules
            {
                id: 'smart-contract-risk',
                name: 'Smart Contract Risk Analysis',
                description: 'Evaluates exposure to smart contract risks',
                category: 'risk',
                condition: (m) => m.riskMetrics.smartContractRisk.score > 0.7,
                impact: (m) => -0.9,
                confidence: (m) => 0.95,
                recommendations: (m) => [
                    'Diversify across multiple protocols',
                    'Prioritize audited protocols',
                    'Consider using smart contract coverage'
                ],
                priority: 1
            }
        ];
    }

    analyze(metrics: DetailedMetrics) {
        this.metricsSnapshot = metrics;
        this.ruleCache.clear();

        // Sort rules by dependencies
        const sortedRules = this.sortRulesByDependencies();

        // Evaluate rules
        const results = sortedRules.map(rule => this.evaluateRule(rule));

        // Generate comprehensive analysis
        return this.generateAnalysis(results);
    }

    private evaluateRule(rule: AdvancedRule) {
        if (this.ruleCache.has(rule.id)) {
            return false;
        }

        // Check dependencies first
        if (rule.dependencies) {
            const dependenciesMet = rule.dependencies.every(depId => {
                if (!this.ruleCache.has(depId)) {
                    const depRule = this.rules.find(r => r.id === depId);
                    if (depRule) {
                        this.evaluateRule(depRule);
                    }
                }
                return this.ruleCache.get(depId);
            });

            if (!dependenciesMet) {
                this.ruleCache.set(rule.id, false);
                return false;
            }
        }

        const isTriggered = rule.condition(this.metricsSnapshot!);
        this.ruleCache.set(rule.id, isTriggered);
        return isTriggered;
    }

    private sortRulesByDependencies(): AdvancedRule[] {
        const visited = new Set<string>();
        const result: AdvancedRule[] = [];

        const visit = (rule: AdvancedRule) => {
            if (visited.has(rule.id)) return;

            if (rule.dependencies) {
                for (const depId of rule.dependencies) {
                    const depRule = this.rules.find(r => r.id === depId);
                    if (depRule) visit(depRule);
                }
            }

            visited.add(rule.id);
            result.push(rule);
        };

        this.rules.forEach(rule => visit(rule));
        return result;
    }

    private generateAnalysis(results: boolean[]) {
        const triggeredRules = this.rules.filter((_, index) => results[index]);

        return {
            patterns: this.extractPatterns(triggeredRules),
            risks: this.extractRisks(triggeredRules),
            recommendations: this.aggregateRecommendations(triggeredRules),
            score: this.calculateOverallScore(triggeredRules)
        };
    }

    private extractPatterns(triggeredRules: AdvancedRule[]) {
        return triggeredRules
            .filter(rule => rule.category === 'pattern')
            .map(rule => ({
                name: rule.name,
                description: rule.description,
                impact: rule.impact(this.metricsSnapshot!),
                confidence: rule.confidence(this.metricsSnapshot!)
            }));
    }

    private extractRisks(triggeredRules: AdvancedRule[]) {
        return triggeredRules
            .filter(rule => rule.category === 'risk')
            .map(rule => ({
                name: rule.name,
                description: rule.description,
                severity: -rule.impact(this.metricsSnapshot!),
                recommendations: rule.recommendations(this.metricsSnapshot!)
            }));
    }

    private aggregateRecommendations(triggeredRules: AdvancedRule[]) {
        const recommendations = triggeredRules.flatMap(rule =>
            rule.recommendations(this.metricsSnapshot!).map(rec => ({
                source: rule.name,
                recommendation: rec,
                priority: rule.priority,
                impact: Math.abs(rule.impact(this.metricsSnapshot!))
            }))
        );

        return recommendations.sort((a, b) =>
            (b.priority * b.impact) - (a.priority * a.impact)
        );
    }

    private calculateOverallScore(triggeredRules: AdvancedRule[]) {
        if (triggeredRules.length === 0) return 1;

        const impacts = triggeredRules.map(rule => ({
            impact: rule.impact(this.metricsSnapshot!),
            confidence: rule.confidence(this.metricsSnapshot!)
        }));

        const weightedImpact = impacts.reduce((sum, { impact, confidence }) =>
            sum + impact * confidence, 0
        ) / impacts.length;

        return Math.max(0, Math.min(1, 1 + weightedImpact));
    }
}