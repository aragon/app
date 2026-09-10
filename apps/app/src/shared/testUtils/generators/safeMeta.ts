import type { ISafeMeta } from '@/shared/api/safeService';

export const generateSafeMeta = (meta?: Partial<ISafeMeta>): ISafeMeta => ({
    source: 'chain',
    fetchedAt: '2026-08-26T12:00:00.000Z',
    stale: false,
    ...meta,
});
