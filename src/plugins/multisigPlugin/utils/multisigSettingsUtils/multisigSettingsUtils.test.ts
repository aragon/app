import { generateDaoMultisigSettings } from '@/plugins/multisigPlugin/testUtils';
import { multisigSettingsUtils } from '@/plugins/multisigPlugin/utils/multisigSettingsUtils';
import { useTranslations } from '@/shared/components/translationsProvider';

describe('multisigSettings utils', () => {
    it('parses settings correctly for minimum approvals and proposal creation when any wallet can create proposals', () => {
        const settings = generateDaoMultisigSettings({ settings: { minApprovals: 2, onlyListed: false } });
        const membersCount = 5;

        const result = multisigSettingsUtils.parseSettings({
            settings,
            membersCount,
            t: useTranslations().t,
        });

        expect(result).toHaveLength(2);

        const [minimumApproval, proposalCreation] = result;

        const expectedMinApprovalTerm = 'app.plugins.multisig.multisigGovernanceSettings.minimumApproval';
        const expectedMinApprovalDefinition = `app.plugins.multisig.multisigGovernanceSettings.approvals (min=${settings.settings.minApprovals},max=${membersCount})`;
        const expectedProposalCreationTerm = 'app.plugins.multisig.multisigGovernanceSettings.proposalCreation';
        const expectedProposalCreationDefinition = 'app.plugins.multisig.multisigGovernanceSettings.anyWallet';

        expect(minimumApproval.term).toBe(expectedMinApprovalTerm);
        expect(minimumApproval.definition).toBe(expectedMinApprovalDefinition);

        expect(proposalCreation.term).toBe(expectedProposalCreationTerm);
        expect(proposalCreation.definition).toBe(expectedProposalCreationDefinition);
    });

    it('parses settings correctly for minimum approvals and proposal creation when only members can create proposals', () => {
        const settings = generateDaoMultisigSettings({ settings: { minApprovals: 3, onlyListed: true } });
        const membersCount = 10;

        const result = multisigSettingsUtils.parseSettings({
            settings,
            membersCount,
            t: useTranslations().t,
        });

        expect(result).toHaveLength(2);

        const [minimumApproval, proposalCreation] = result;

        const expectedMinApprovalTerm = 'app.plugins.multisig.multisigGovernanceSettings.minimumApproval';
        const expectedMinApprovalDefinition = `app.plugins.multisig.multisigGovernanceSettings.approvals (min=${settings.settings.minApprovals},max=${membersCount})`;
        const expectedProposalCreationTerm = 'app.plugins.multisig.multisigGovernanceSettings.proposalCreation';
        const expectedProposalCreationDefinition = 'app.plugins.multisig.multisigGovernanceSettings.members';

        expect(minimumApproval.term).toBe(expectedMinApprovalTerm);
        expect(minimumApproval.definition).toBe(expectedMinApprovalDefinition);

        expect(proposalCreation.term).toBe(expectedProposalCreationTerm);
        expect(proposalCreation.definition).toBe(expectedProposalCreationDefinition);
    });

    it('handles cases with zero members and minimum approvals', () => {
        const settings = generateDaoMultisigSettings({ settings: { minApprovals: 0, onlyListed: false } });
        const membersCount = 0;

        const result = multisigSettingsUtils.parseSettings({
            settings,
            membersCount,
            t: useTranslations().t,
        });

        expect(result).toHaveLength(2);

        const [minimumApproval, proposalCreation] = result;

        const expectedMinApprovalTerm = 'app.plugins.multisig.multisigGovernanceSettings.minimumApproval';
        const expectedMinApprovalDefinition = `app.plugins.multisig.multisigGovernanceSettings.approvals (min=${settings.settings.minApprovals},max=${membersCount})`;
        const expectedProposalCreationTerm = 'app.plugins.multisig.multisigGovernanceSettings.proposalCreation';
        const expectedProposalCreationDefinition = 'app.plugins.multisig.multisigGovernanceSettings.anyWallet';

        expect(minimumApproval.term).toBe(expectedMinApprovalTerm);
        expect(minimumApproval.definition).toBe(expectedMinApprovalDefinition);

        expect(proposalCreation.term).toBe(expectedProposalCreationTerm);
        expect(proposalCreation.definition).toBe(expectedProposalCreationDefinition);
    });

    it('handles cases where only members can create proposals but there are no members', () => {
        const settings = generateDaoMultisigSettings({ settings: { minApprovals: 1, onlyListed: true } });
        const membersCount = 0;

        const result = multisigSettingsUtils.parseSettings({
            settings,
            membersCount,
            t: useTranslations().t,
        });

        expect(result).toHaveLength(2);

        const [minimumApproval, proposalCreation] = result;

        const expectedMinApprovalTerm = 'app.plugins.multisig.multisigGovernanceSettings.minimumApproval';
        const expectedMinApprovalDefinition = `app.plugins.multisig.multisigGovernanceSettings.approvals (min=${settings.settings.minApprovals},max=${membersCount})`;
        const expectedProposalCreationTerm = 'app.plugins.multisig.multisigGovernanceSettings.proposalCreation';
        const expectedProposalCreationDefinition = 'app.plugins.multisig.multisigGovernanceSettings.members';

        expect(minimumApproval.term).toBe(expectedMinApprovalTerm);
        expect(minimumApproval.definition).toBe(expectedMinApprovalDefinition);

        expect(proposalCreation.term).toBe(expectedProposalCreationTerm);
        expect(proposalCreation.definition).toBe(expectedProposalCreationDefinition);
    });
});
