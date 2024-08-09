import { type IDaoSettingTermAndDefinition } from '@/modules/settings/types';
import { type IDaoMultisigSettings } from '@/plugins/multisigPlugin/types';
import { multisigSettingsUtils } from '@/plugins/multisigPlugin/utils/multisigSettingsUtils';
import { type TranslationFunction } from '@/shared/components/translationsProvider/translationsProvider';

describe('multisigSettingsUtils', () => {
    const mockTranslations: TranslationFunction = (key: string, options?: Record<string, unknown>) => {
        switch (key) {
            case 'app.plugins.multisig.multisigGovernanceSettings.minimumApproval':
                return 'Minimum Approval';
            case 'app.plugins.multisig.multisigGovernanceSettings.approvals':
                return `Approvals (min=${options?.min}, max=${options?.max})`;
            case 'app.plugins.multisig.multisigGovernanceSettings.proposalCreation':
                return 'Proposal Creation';
            case 'app.plugins.multisig.multisigGovernanceSettings.members':
                return 'Only members can create proposals';
            case 'app.plugins.multisig.multisigGovernanceSettings.anyWallet':
                return 'Any wallet can create proposals';
            default:
                return key;
        }
    };

    const generateMockSettings = (minApprovals: number, onlyListed: boolean): IDaoMultisigSettings => ({
        settings: {
            minApprovals,
            onlyListed,
        },
        id: '',
        pluginAddress: '',
        pluginSubdomain: '',
    });

    it('parses settings correctly for minimum approvals and proposal creation when any wallet can create proposals', () => {
        const settings = generateMockSettings(2, false);
        const membersCount = 5;

        const result: IDaoSettingTermAndDefinition[] = multisigSettingsUtils.parseSettings({
            settings,
            membersCount,
            t: mockTranslations,
        });

        expect(result).toHaveLength(2);

        const [minimumApproval, proposalCreation] = result;

        expect(minimumApproval.term).toBe('Minimum Approval');
        expect(minimumApproval.definition).toBe('Approvals (min=2, max=5)');

        expect(proposalCreation.term).toBe('Proposal Creation');
        expect(proposalCreation.definition).toBe('Any wallet can create proposals');
    });

    it('parses settings correctly for minimum approvals and proposal creation when only members can create proposals', () => {
        const settings = generateMockSettings(3, true);
        const membersCount = 10;

        const result: IDaoSettingTermAndDefinition[] = multisigSettingsUtils.parseSettings({
            settings,
            membersCount,
            t: mockTranslations,
        });

        expect(result).toHaveLength(2);

        const [minimumApproval, proposalCreation] = result;

        expect(minimumApproval.term).toBe('Minimum Approval');
        expect(minimumApproval.definition).toBe('Approvals (min=3, max=10)');

        expect(proposalCreation.term).toBe('Proposal Creation');
        expect(proposalCreation.definition).toBe('Only members can create proposals');
    });

    it('handles cases with zero members and minimum approvals', () => {
        const settings = generateMockSettings(0, false);
        const membersCount = 0;

        const result: IDaoSettingTermAndDefinition[] = multisigSettingsUtils.parseSettings({
            settings,
            membersCount,
            t: mockTranslations,
        });

        expect(result).toHaveLength(2);

        const [minimumApproval, proposalCreation] = result;

        expect(minimumApproval.term).toBe('Minimum Approval');
        expect(minimumApproval.definition).toBe('Approvals (min=0, max=0)');

        expect(proposalCreation.term).toBe('Proposal Creation');
        expect(proposalCreation.definition).toBe('Any wallet can create proposals');
    });

    it('handles cases where only members can create proposals but there are no members', () => {
        const settings = generateMockSettings(1, true);
        const membersCount = 0;

        const result: IDaoSettingTermAndDefinition[] = multisigSettingsUtils.parseSettings({
            settings,
            membersCount,
            t: mockTranslations,
        });

        expect(result).toHaveLength(2);

        const [minimumApproval, proposalCreation] = result;

        expect(minimumApproval.term).toBe('Minimum Approval');
        expect(minimumApproval.definition).toBe('Approvals (min=1, max=0)');

        expect(proposalCreation.term).toBe('Proposal Creation');
        expect(proposalCreation.definition).toBe('Only members can create proposals');
    });
});
