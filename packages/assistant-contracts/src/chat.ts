import { z } from 'zod';
import { assistantLimits } from './limits';

// A recent on-chain action captured for debugging; surfaced only in the Linear ticket, never shown
// back to the user in chat.
export const debugTransactionSchema = z.object({
    hash: z.string().optional(),
    status: z.string(),
    type: z.string().optional(),
});

export type IDebugTransaction = z.infer<typeof debugTransactionSchema>;

// Context the app collects silently and passes alongside every request; never asked for in chat and
// (as of the p4 polish) never shown to the user — it is attached automatically to the ticket for the
// support team to debug with. walletAddress doubles as the Sentry `user.id` for replay lookup.
export const appContextSchema = z.object({
    daoAddress: z.string().optional(),
    network: z.string().optional(),
    route: z.string(),
    appVersion: z.string(),
    walletAddress: z.string().optional(),
    chainId: z.number().optional(),
    // Capped client-side; only the most recent few actions are useful for debugging.
    recentTransactions: z.array(debugTransactionSchema).max(10).optional(),
});

export type IAppContext = z.infer<typeof appContextSchema>;

const textPartSchema = z.object({
    type: z.literal('text'),
    text: z.string().max(assistantLimits.maxMessageLength),
});

// Non-text parts (data parts, step markers) are tolerated so the client can post its UIMessage
// history verbatim; the server only ever reads text parts.
const opaquePartSchema = z
    .object({ type: z.string() })
    .loose()
    .refine((part) => part.type !== 'text');

export const chatMessageSchema = z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant']),
    parts: z.array(z.union([textPartSchema, opaquePartSchema])),
});

export type IChatMessage = z.infer<typeof chatMessageSchema>;

export const chatRequestSchema = z.object({
    sessionId: z.uuid(),
    messages: z
        .array(chatMessageSchema)
        .min(1)
        .max(assistantLimits.maxMessages),
    appContext: appContextSchema,
});

export type IChatRequest = z.infer<typeof chatRequestSchema>;
