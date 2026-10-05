import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { metricsMiddleware, metricsHandler } from './metrics';
import { errorHandler, notFound } from './middleware/errors';
import auth from './routes/auth';
import profile from './routes/profile';
import plans from './routes/plans';
import tracking from './routes/tracking';
import dashboard from './routes/dashboard';
import health from './routes/health';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: [config.frontendUrl, 'http://localhost:5173'] }));
app.use(express.json({ limit: '100kb' }));
app.use(metricsMiddleware);

app.use('/api/auth', auth);
app.use('/api/profile', profile);
app.use('/api/plans', plans);
app.use('/api/dashboard', dashboard);
app.use('/api/health', health);
app.use('/health', health);
app.get('/api/metrics', metricsHandler);
app.use('/api', tracking); // keep last: applies auth to remaining /api paths

app.use(notFound);
app.use(errorHandler);
