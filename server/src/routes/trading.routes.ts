import { Router } from 'express';
import tradingController from '../controllers/trading.controller';

const router = Router();

router.get('/trading/:walletAddress', tradingController.getTradingData);

export default router;
