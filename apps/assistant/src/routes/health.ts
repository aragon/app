import type { IHealthResponse } from '@aragon/assistant-contracts';
import { Hono } from 'hono';
import { env } from '../lib/env';

export const healthRoute = new Hono().get('/', (context) => {
    const response: IHealthResponse = {
        status: 'ok',
        environment: env.environment(),
    };

    return context.json(response);
});
