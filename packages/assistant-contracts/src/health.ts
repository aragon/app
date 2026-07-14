import { z } from 'zod';

export const healthResponseSchema = z.object({
    status: z.literal('ok'),
    environment: z.enum(['local', 'development', 'preview', 'production']),
});

export type IHealthResponse = z.infer<typeof healthResponseSchema>;
