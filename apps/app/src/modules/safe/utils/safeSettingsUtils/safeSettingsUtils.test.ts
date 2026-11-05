import locales from '@/assets/locales/en.json';
import { Network } from '@/shared/api/daoService';
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

    it('states the live requirement and current nonce', () => {
        const [threshold, nonce] = safeSettingsUtils.liveConfigurationRows({
            safeInfo,
            t,
        });

        expect(threshold.term).toEqual('Required confirmations');
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
        expect(rows[0].link).toBeUndefined();
        expect(rows[1].definition).toEqual('2');
        expect(safeSettingsUtils.authorityRows({ safeInfo, t })).toEqual([]);
    });

    it('links the guard where its address resolves', () => {
        const guard = '0x0000000000000000000000000000000000000099';
        const [row] = safeSettingsUtils.authorityRows({
            safeInfo: generateSafeInfo({ guard }),
            buildAddressHref: (address) => `https://explorer/${address}`,
            t,
        });

        expect(row.link).toEqual({
            href: `https://explorer/${guard}`,
            isExternal: true,
            isOnchainEntity: true,
        });
    });

    it('lists the guard and each module as contracts, naming the official modules', () => {
        const guard = '0x0000000000000000000000000000000000000099';
        const allowanceModule = '0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134';
        const unknownModule = '0x0000000000000000000000000000000000000022';

        const rows = safeSettingsUtils.contractRows({
            safeInfo: generateSafeInfo({
                guard,
                modules: [allowanceModule, unknownModule],
            }),
            network: Network.ETHEREUM_SEPOLIA,
            buildAddressHref: (address) => `https://explorer/${address}`,
            t,
        });

        expect(
            rows.map(({ term, description, copyValue }) => ({
                term,
                description,
                copyValue,
            })),
        ).toEqual([
            {
                term: 'Transaction guard',
                description: 'Checks every transaction before it executes',
                copyValue: guard,
            },
            {
                term: 'Allowance module',
                description: 'Safe module v0.1.0',
                copyValue: allowanceModule,
            },
            {
                term: 'Module',
                description: 'Unrecognised module',
                copyValue: unknownModule,
            },
        ]);
        expect(rows[1].link?.href).toEqual(
            `https://explorer/${allowanceModule}`,
        );
    });

    it('lists no contracts for a Safe with neither guard nor modules, and links none without an href', () => {
        expect(
            safeSettingsUtils.contractRows({
                safeInfo,
                network: Network.ETHEREUM_SEPOLIA,
                t,
            }),
        ).toEqual([]);

        const [row] = safeSettingsUtils.contractRows({
            safeInfo: generateSafeInfo({
                modules: ['0x0000000000000000000000000000000000000022'],
            }),
            network: Network.ETHEREUM_SEPOLIA,
            t,
        });

        expect(row.link).toBeUndefined();
    });
});
