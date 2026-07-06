/**
 * Versioned schema stored on IPFS and referenced from the ENS text record
 * `<3char-chain>.<tokenAddress>.delegate`. The shape was sent to ENS for
 * review on 2026-04-30 and is tentatively locked at v1; ENS feedback may
 * adjust it before launch.
 */
export interface IDelegateStatement {
    version: 1;
    type: 'statement';
    format: 'markdown';
    content: string;
}

export const isDelegateStatement = (
    value: unknown,
): value is IDelegateStatement => {
    if (value == null || typeof value !== 'object') {
        return false;
    }
    const candidate = value as Record<string, unknown>;
    return (
        candidate.version === 1 &&
        candidate.type === 'statement' &&
        candidate.format === 'markdown' &&
        typeof candidate.content === 'string'
    );
};
