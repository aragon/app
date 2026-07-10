import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getConfig } from './lib/config';
import { buildCorsOriginResolver } from './lib/corsOrigin';
import { healthRoute } from './routes/health';

export const createApp = () => {
    const app = new Hono();

    const resolveCorsOrigin = buildCorsOriginResolver(
        getConfig().corsAllowedOrigins,
    );
    app.use('*', cors({ origin: (origin) => resolveCorsOrigin(origin) }));

    app.route('/health', healthRoute);

    return app;
};
