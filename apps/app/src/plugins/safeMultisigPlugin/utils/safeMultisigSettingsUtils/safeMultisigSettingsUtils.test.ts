import {
    generateSafeInfo,
    generateSafeMultisigTransaction,
} from '../../testUtils';
import {
    type ISafeMultisigSettingsParseParams,
    safeMultisigSettingsUtils,
} from './safeMultisigSettingsUtils';

describe('safeMultisigSettings utils', () => {
    const t = jest.fn((key: string, params?: Record<string, unknown>) =>
        params == null ? key : `${key}:${JSON.stringify(params)}`,
    );

    const safeName = 'founders.safe.eth';
    const safeHref =
        'https://app.safe.global/home?safe=sep:0xd84C233A7D1578021d21E39785439bEdDB165F3D';
    afterEach(() => {
        t.mockClear();
    });

    const parse = (
        safeInfo = generateSafeInfo(),
        overrides?: Partial<ISafeMultisigSettingsParseParams>,
    ) =>
        safeMultisigSettingsUtils.parseSettings({
            safeInfo,
            address: safeInfo.address,
            version: safeInfo.version,
            safeName,
            safeHref,
            t,
            ...overrides,
        });

    it('states the Safe particulars that used to be repeated on the breakdown', () => {
        const settings = parse(
            generateSafeInfo({
                address: '0x0000000000000000000000000000000000000001',
                threshold: 3,
                owners: [
                    '0x0000000000000000000000000000000000000011',
                    '0x0000000000000000000000000000000000000012',
                    '0x0000000000000000000000000000000000000013',
                    '0x0000000000000000000000000000000000000014',
                ],
                nonce: '42',
                version: '1.4.1+L2',
            }),
        );

        const byTerm = Object.fromEntries(
            settings.map((setting) => [setting.term, setting.definition]),
        );
        const key = 'app.safe.safeSettings';

        // A live threshold's owner set is readable, so the row carries its denominator; the
        // settled row below cannot, which is what makes the two read differently.
        expect(byTerm[`${key}.threshold`]).toEqual(
            `${key}.thresholdValue:{"threshold":3,"owners":4}`,
        );
        // Named "current" because it is live account state: it advances with every transaction the
        // Safe executes, so it is not the nonce this proposal's transaction used.
        expect(byTerm[`${key}.currentNonce`]).toEqual('42');
        // The version qualifies the live address rather than standing as configuration of its own.
        expect(
            settings.find((setting) => setting.term === `${key}.safe`)
                ?.description,
        ).toEqual(`${key}.versionHelp:{"version":"1.4.1+L2"}`);
    });

    it('states the configuration the decision ran under once the body has reported', () => {
        // A Safe binds `confirmationsRequired` into each transaction, so a report executed by a
        // 1-of-2 Safe still says 1 after the owners raise the threshold to 3.
        const settings = parse(
            generateSafeInfo({ threshold: 3, nonce: '42' }),
            {
                settledTransaction: generateSafeMultisigTransaction({
                    confirmationsRequired: 1,
                    nonce: '5',
                }),
            },
        );

        const byTerm = Object.fromEntries(
            settings.map((setting) => [setting.term, setting.definition]),
        );
        const key = 'app.safe.safeSettings';

        expect(byTerm[`${key}.threshold`]).toEqual('1');
        expect(byTerm[`${key}.nonce`]).toEqual('5');
        expect(byTerm[`${key}.currentNonce`]).toBeUndefined();
        // Safe serves only the current version, and a contract can be upgraded after a decision
        // executes: no row beats a row that quietly means "today".
        expect(byTerm[`${key}.version`]).toBeUndefined();
        // Strategy and execution left with the rows that restated the plugin's own name and a rule
        // the advance gate already enforces.
        expect(byTerm[`${key}.strategy`]).toBeUndefined();
        expect(byTerm[`${key}.execution`]).toBeUndefined();
    });

    it('states no configuration once a body is decided but its numbers are unrecoverable', () => {
        // A veto body that never vetoed leaves no transaction at all, so there is nothing to
        // recover and the live Safe is exactly what must not fill the gap.
        const settings = parse(
            generateSafeInfo({ threshold: 3, nonce: '42' }),
            {
                isDecided: true,
            },
        );

        const terms = settings.map((setting) => setting.term);
        const key = 'app.safe.safeSettings';

        expect(terms).not.toContain(`${key}.threshold`);
        expect(terms).not.toContain(`${key}.currentNonce`);
        expect(terms).not.toContain(`${key}.version`);
        // The Safe itself is still worth stating: identity is not configuration.
        expect(terms).toContain(`${key}.safe`);
    });

    it('says the threshold was not recovered when the scan ran out of pages', () => {
        // An incomplete read is not the same claim as "there is nothing to recover": the number
        // exists in the Safe's history, past where this view looked. Silence would read as the
        // permanent case, and the live threshold would be today's configuration mislabelled.
        const settings = parse(
            generateSafeInfo({ threshold: 3, nonce: '42' }),
            {
                isDecided: true,
                isScanExhausted: true,
            },
        );

        const key = 'app.safe.safeSettings';
        const threshold = settings.find(
            (setting) => setting.term === `${key}.threshold`,
        );

        expect(threshold?.definition).toBe(`${key}.notRecovered`);
        // Still never today's numbers: no live nonce, no live version.
        expect(settings.map((setting) => setting.term)).not.toContain(
            `${key}.currentNonce`,
        );
    });

    const safeRowOf = (settings: ReturnType<typeof parse>) =>
        settings.find(
            (setting) => setting.term === 'app.safe.safeSettings.safe',
        );

    it('sends the Safe row out to the Safe app, and offers the raw address to copy', () => {
        const safeInfo = generateSafeInfo({
            address: '0x0000000000000000000000000000000000000001',
        });
        const safeRow = safeRowOf(parse(safeInfo));

        expect(safeRow?.definition).toEqual(safeName);
        expect(safeRow?.link?.href).toEqual(safeHref);
        // The Safe's own account page is another product on another domain: leaving the app must be
        // visible, not a surprise.
        expect(safeRow?.link?.isExternal).toBe(true);
        // Hands the row to the kit's address output: the label reads, the full address reveals.
        expect(safeRow?.link?.isOnchainEntity).toBe(true);
        // The truncated name is what reads well; the full address is what a user needs to paste.
        expect(safeRow?.copyValue).toEqual(safeInfo.address);
    });

    it('states the Safe without a link when the Safe app cannot address the network', () => {
        const settings = parse(generateSafeInfo(), { safeHref: undefined });

        expect(safeRowOf(settings)?.definition).toEqual(safeName);
        expect(safeRowOf(settings)?.link).toBeUndefined();
    });

    it('states an unknown version explicitly rather than trailing an empty qualifier', () => {
        expect(
            safeRowOf(parse(generateSafeInfo({ version: null })))?.description,
        ).toEqual(
            'app.safe.safeSettings.versionHelp:{"version":"app.safe.safeSettings.unknownVersion"}',
        );
    });
});
