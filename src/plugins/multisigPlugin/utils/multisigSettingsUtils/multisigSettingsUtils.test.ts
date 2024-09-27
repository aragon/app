import { generateDaoMultisigSettings } from '@/plugins/multisigPlugin/testUtils';
import { multisigSettingsUtils } from '@/plugins/multisigPlugin/utils/multisigSettingsUtils';
import { mockTranslations } from '@/test/utils';

describe('multisigSettings utils', () => {
    describe('parseSettings method', () => {
        it('correctly formats minimum approvals and proposal creation when any wallet can create proposals', () => {
            const settings = generateDaoMultisigSettings({ minApprovals: 2, onlyListed: false });
            const membersCount = 5;

            const result = multisigSettingsUtils.parseSettings({
                settings,
                membersCount,
                t: mockTranslations.tMock,
            });

            const [minimumApproval, proposalCreation] = result;

            expect(minimumApproval.term).toBe('app.plugins.multisig.multisigGovernanceSettings.minimumApproval');
            expect(minimumApproval.definition).toBe(
                'app.plugins.multisig.multisigGovernanceSettings.approvals (min=2,max=5)',
            );

            expect(proposalCreation.term).toBe('app.plugins.multisig.multisigGovernanceSettings.proposalCreation');
            expect(proposalCreation.definition).toBe('app.plugins.multisig.multisigGovernanceSettings.anyWallet');
        });

        it('correctly formats minimum approvals and proposal creation when only members can create proposals', () => {
            const settings = generateDaoMultisigSettings({ minApprovals: 3, onlyListed: true });
            const membersCount = 10;

            const result = multisigSettingsUtils.parseSettings({
                settings,
                membersCount,
                t: mockTranslations.tMock,
            });

            const [minimumApproval, proposalCreation] = result;

            expect(minimumApproval.term).toBe('app.plugins.multisig.multisigGovernanceSettings.minimumApproval');
            expect(minimumApproval.definition).toBe(
                'app.plugins.multisig.multisigGovernanceSettings.approvals (min=3,max=10)',
            );

            expect(proposalCreation.term).toBe('app.plugins.multisig.multisigGovernanceSettings.proposalCreation');
            expect(proposalCreation.definition).toBe('app.plugins.multisig.multisigGovernanceSettings.members');
        });

        it('handles zero members and minimum approvals when any wallet can create proposals', () => {
            const settings = generateDaoMultisigSettings({ minApprovals: 0, onlyListed: false });
            const membersCount = 0;

            const result = multisigSettingsUtils.parseSettings({
                settings,
                membersCount,
                t: mockTranslations.tMock,
            });

            const [minimumApproval, proposalCreation] = result;

            expect(minimumApproval.term).toBe('app.plugins.multisig.multisigGovernanceSettings.minimumApproval');
            expect(minimumApproval.definition).toBe(
                'app.plugins.multisig.multisigGovernanceSettings.approvals (min=0,max=0)',
            );

            expect(proposalCreation.term).toBe('app.plugins.multisig.multisigGovernanceSettings.proposalCreation');
            expect(proposalCreation.definition).toBe('app.plugins.multisig.multisigGovernanceSettings.anyWallet');
        });

        it('handles zero members when only members can create proposals', () => {
            const settings = generateDaoMultisigSettings({ minApprovals: 1, onlyListed: true });
            const membersCount = 0;

            const result = multisigSettingsUtils.parseSettings({
                settings,
                membersCount,
                t: mockTranslations.tMock,
            });

            const [minimumApproval, proposalCreation] = result;

            expect(minimumApproval.term).toBe('app.plugins.multisig.multisigGovernanceSettings.minimumApproval');
            expect(minimumApproval.definition).toBe(
                'app.plugins.multisig.multisigGovernanceSettings.approvals (min=1,max=0)',
            );

            expect(proposalCreation.term).toBe('app.plugins.multisig.multisigGovernanceSettings.proposalCreation');
            expect(proposalCreation.definition).toBe('app.plugins.multisig.multisigGovernanceSettings.members');
        });
    });
});
