import { parseRecoveryShare, serializeRecoveryShare } from './recoveryShare';

describe('recoveryShare utils', () => {
    const value =
        '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318';

    it('serializes and parses a recovery share', () => {
        const share = { systemId: 'sys-1', epoch: 2, index: 3, value } as const;
        const text = serializeRecoveryShare(share);
        expect(text).toBe(`aragon-mpc-recovery:v1:sys-1:2:3:${value}`);
        expect(parseRecoveryShare(text)).toEqual(share);
    });

    it('parses a raw hex share with a fallback context', () => {
        expect(
            parseRecoveryShare(`  ${value}\n`, { systemId: 'sys-1', epoch: 1 }),
        ).toEqual({ systemId: 'sys-1', epoch: 1, index: 3, value });
    });

    it('throws on invalid input', () => {
        expect(() => parseRecoveryShare('foo')).toThrow();
        expect(() => parseRecoveryShare(value)).toThrow();
        expect(() =>
            parseRecoveryShare('aragon-mpc-recovery:v1:sys:x:3:0x00'),
        ).toThrow();
    });
});
