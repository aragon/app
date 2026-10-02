import type {
    ISafeInfoResponse,
    ISafeNextNonceResponse,
    ISafeQueueResponse,
} from '@/shared/api/safeService';
import { generateSafeInfo } from './safeInfo';
import { generateSafeMeta } from './safeMeta';

export const generateSafeInfoResponse = (
    response?: Partial<ISafeInfoResponse>,
): ISafeInfoResponse => ({
    ...generateSafeInfo(),
    meta: generateSafeMeta(),
    ...response,
});

export const generateSafeQueueResponse = (
    response?: Partial<ISafeQueueResponse>,
): ISafeQueueResponse => ({
    count: 0,
    next: null,
    previous: null,
    results: [],
    meta: generateSafeMeta(),
    ...response,
});

export const generateSafeNextNonceResponse = (
    response?: Partial<ISafeNextNonceResponse>,
): ISafeNextNonceResponse => ({
    nextNonce: '0',
    currentNonce: '0',
    meta: generateSafeMeta({ source: 'safe-api' }),
    ...response,
});
