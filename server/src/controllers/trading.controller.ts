import { Request, Response } from 'express';
import { DuneAPIClient } from './dune-client'; // Import the previous DuneAPIClient class
import { config } from '../config/env';

const duneClient = new DuneAPIClient(config.duneApiKey);

const getTradingData = async (req: Request, res: Response) => {
    try {
        const { walletAddress } = req.params;

        if (!walletAddress) {
            res.status(400).json({ error: 'Wallet address is required' });
        }

        const tradingData = await duneClient.getWalletTradingData(
            config.queryId,
            walletAddress
        );

        res.json({
            success: true,
            data: tradingData,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            error: errorMessage,
        });
    }
};


export default {
    getTradingData
}