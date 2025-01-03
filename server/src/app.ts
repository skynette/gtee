import express from 'express';
import cors from 'cors';
import tradingRoutes from './routes/trading.routes';
import { errorHandler } from './middleware/error.middleware';
import { config } from './config/env';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());


// Routes
app.get('/test', (req, res) => {
    res.send('API is working');
});
app.use('/api', tradingRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});
