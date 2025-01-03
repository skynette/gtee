export const ANALYSIS_CONFIG = {
    modelConfig: {
        transformerConfig: {
            modelName: 'Xenova/LaMini-Flan-T5-248M',
            maxLength: 500,
            temperature: 0.7
        },
        tfConfig: {
            modelPath: '/models/wallet-analysis',
            inputShape: [1, 12]
        }
    },
    refreshInterval: 300000, // 5 minutes
    maxTransactions: 1000
};