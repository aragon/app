import { generateSafeInfo } from '../../testUtils';
import { safeMultisigSettingsUtils } from './safeMultisigSettingsUtils';

describe('safeMultisigSettings utils', () => {
    const t = jest.fn((key: string, params?: Record<string, unknown>) =>
        params == null ? key : `${key}:${JSON.stringify(params)}`,
    );

    afterEach(() => {
        t.mockClear();
    });

    it('returns the live Safe approval rule, owner count and version', () => {
        const settings = safeMultisigSettingsUtils.parseSettings({
            safeInfo: generateSafeInfo({
                threshold: 1,
                owners: [
                    '0x0000000000000000000000000000000000000011',
                    '0x0000000000000000000000000000000000000012',
                ],
                version: '1.4.1+L2',
            }),
            isVeto: false,
            t,
        });

        expect(settings).toEqual([
            {
                term: 'app.plugins.safeMultisig.safeMultisigGovernanceSettings.approvalRule',
                definition:
                    'app.plugins.safeMultisig.safeMultisigGovernanceSettings.threshold:{"min":1,"max":2}',
            },
            {
                term: 'app.plugins.safeMultisig.safeMultisigGovernanceSettings.owners',
                definition: '2',
            },
            {
                term: 'app.plugins.safeMultisig.safeMultisigGovernanceSettings.version',
                definition: '1.4.1+L2',
            },
        ]);
    });

    it('uses the veto term and an explicit fallback for an unknown version', () => {
        const settings = safeMultisigSettingsUtils.parseSettings({
            safeInfo: generateSafeInfo({ version: null }),
            isVeto: true,
            t,
        });

        expect(settings[0].term).toEqual(
            'app.plugins.safeMultisig.safeMultisigGovernanceSettings.vetoRule',
        );
        expect(settings[2].definition).toEqual(
            'app.plugins.safeMultisig.safeMultisigGovernanceSettings.unknownVersion',
        );
    });
});
