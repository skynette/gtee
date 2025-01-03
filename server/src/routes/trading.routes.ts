import { Router } from 'express';
import { enqueueTradingDataTask, getTradingDataTask } from '../controllers/trading.controller';

const router = Router();

router.post('/analyze-trades', enqueueTradingDataTask);
router.get('/task/:execution_id', getTradingDataTask);

export default router;
