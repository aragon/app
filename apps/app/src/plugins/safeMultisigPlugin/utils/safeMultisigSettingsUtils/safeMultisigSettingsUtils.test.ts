import { generateSafeInfo } from '../../testUtils';
import { safeMultisigSettingsUtils } from './safeMultisigSettingsUtils';

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

    const parse = (safeInfo = generateSafeInfo()) =>
        safeMultisigSettingsUtils.parseSettings({
            safeInfo,
            safeName,
            safeHref,
            t,
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
        const key = 'app.plugins.safeMultisig.safeMultisigGovernanceSettings';

        expect(byTerm[`${key}.strategy`]).toEqual(`${key}.strategyValue`);
        expect(byTerm[`${key}.threshold`]).toEqual(
            `${key}.thresholdValue:{"min":3,"max":4}`,
        );
        // Named "current" because it is live account state: it advances with every transaction the
        // Safe executes, so it is not the nonce this proposal's transaction used.
        expect(byTerm[`${key}.currentNonce`]).toEqual('42');
        expect(byTerm[`${key}.version`]).toEqual('1.4.1+L2');
        expect(byTerm[`${key}.execution`]).toEqual(`${key}.executionValue`);
    });

    const safeRowOf = (settings: ReturnType<typeof parse>) =>
        settings.find(
            (setting) =>
                setting.term ===
                'app.plugins.safeMultisig.safeMultisigGovernanceSettings.safe',
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
        // The truncated name is what reads well; the full address is what a user needs to paste.
        expect(safeRow?.copyValue).toEqual(safeInfo.address);
    });

    it('states the Safe without a link when the Safe app cannot address the network', () => {
        const settings = safeMultisigSettingsUtils.parseSettings({
            safeInfo: generateSafeInfo(),
            safeName,
            safeHref: undefined,
            t,
        });

        expect(safeRowOf(settings)?.definition).toEqual(safeName);
        expect(safeRowOf(settings)?.link).toBeUndefined();
    });

    it('states an unknown version explicitly rather than leaving the row blank', () => {
        const settings = parse(generateSafeInfo({ version: null }));
        const versionRow = settings.find(
            (setting) =>
                setting.term ===
                'app.plugins.safeMultisig.safeMultisigGovernanceSettings.version',
        );

        expect(versionRow?.definition).toEqual(
            'app.plugins.safeMultisig.safeMultisigGovernanceSettings.unknownVersion',
        );
    });
});
