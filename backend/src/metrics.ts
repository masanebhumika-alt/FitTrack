import client from 'prom-client';
import { Request, Response, NextFunction } from 'express';

client.collectDefaultMetrics();

export const requests = new client.Counter({
  name: 'fittrack_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

export const latency = new client.Histogram({
  name: 'fittrack_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
});

// Business metrics shown on the Grafana dashboard
export const usersRegistered = new client.Counter({
  name: 'fittrack_users_registered_total',
  help: 'Total users registered',
});
export const loginAttempts = new client.Counter({
  name: 'fittrack_login_attempts_total',
  help: 'Login attempts by result',
  labelNames: ['result'],
});
export const plansGenerated = new client.Counter({
  name: 'fittrack_plans_generated_total',
  help: 'Fitness plans generated',
  labelNames: ['goal'],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    // Use the matched route pattern (never the raw URL) to keep label cardinality low.
    const route = req.route ? `${req.baseUrl}${req.route.path === '/' ? '' : req.route.path}` || '/' : 'unmatched';
    const seconds = Number(process.hrtime.bigint() - start) / 1e9;
    requests.inc({ method: req.method, route, status: String(res.statusCode) });
    latency.observe({ method: req.method, route }, seconds);
  });
  next();
}

export async function metricsHandler(_req: Request, res: Response) {
  res.setHeader('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
}
