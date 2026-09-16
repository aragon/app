import locales from '@/assets/locales/en.json';
import { generateSafeInfo } from '@/shared/testUtils';
import { safeSettingsUtils } from './safeSettingsUtils';

describe('safeSettings utils', () => {
    /**
     * Resolved against the real copy rather than echoed back. A row naming a key nobody defined
     * renders the key path itself, and an echoing mock cannot tell that apart from a translation:
     * this surface already shipped one row pointing at a `thresholdValue` that did not exist.
     */
    const t = (key: string, values?: Record<string, unknown>) => {
        const copy = key
            .split('.')
            .reduce<unknown>(
                (branch, part) =>
                    (branch as Record<string, unknown> | undefined)?.[part],
                locales,
            );

        if (typeof copy !== 'string') {
            throw new Error(`No copy defined for ${key}`);
        }

        return copy.replace(/{{(\w+)}}/g, (_match, name: string) =>
            String(values?.[name]),
        );
    };

    const safeInfo = generateSafeInfo({
        threshold: 2,
        owners: [
            '0x0000000000000000000000000000000000000011',
            '0x0000000000000000000000000000000000000012',
            '0x0000000000000000000000000000000000000013',
        ],
        nonce: '9',
    });

    it('states what a live Safe requires against the owner set it is drawn from', () => {
        const [threshold, nonce] = safeSettingsUtils.liveConfigurationRows({
            safeInfo,
            t,
        });

        expect(threshold.term).toEqual('Required confirmations');
        // "2" alone understates the account: two signatures out of three owners is the authority
        // picture, and no owner row sits beside this one to supply the denominator.
        expect(threshold.definition).toEqual('2 of 3');
        expect(nonce.term).toEqual('Current Safe nonce');
        expect(nonce.definition).toEqual('9');
    });

    it('names the Safe before its account state is readable', () => {
        // The address comes from the route, so the row stands while the read is in flight and on
        // networks Safe never serves - both cases where the version genuinely is not known.
        const row = safeSettingsUtils.addressRow({
            address: safeInfo.address,
            safeName: 'founders.safe.eth',
            t,
        });

        expect(row.definition).toEqual('founders.safe.eth');
        expect(row.copyValue).toEqual(safeInfo.address);
        expect(row.link).toBeUndefined();
        expect(row.description).toEqual('Safe unknown version');
    });

    it('discloses a guard and modules, and states neither when a Safe has neither', () => {
        const guard = '0x0000000000000000000000000000000000000099';
        const rows = safeSettingsUtils.authorityRows({
            safeInfo: generateSafeInfo({
                guard,
                modules: [
                    '0x0000000000000000000000000000000000000021',
                    '0x0000000000000000000000000000000000000022',
                ],
            }),
            t,
        });

        expect(rows.map((row) => row.term)).toEqual([
            'Transaction guard',
            'Enabled modules',
        ]);
        expect(rows[0].copyValue).toEqual(guard);
        expect(rows[1].definition).toEqual('2');
        expect(safeSettingsUtils.authorityRows({ safeInfo, t })).toEqual([]);
    });
});
