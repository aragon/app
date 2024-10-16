import { mockTranslations } from '@/test/utils';
import { adminSettingsUtils } from './adminSettingsUtils';

describe('adminSettings utils', () => {
    describe('parseSettings', () => {
        it('returns correct governance settings for admin plugin', () => {
            const [proposalCreation, proposalExecution] = adminSettingsUtils.parseSettings({
                t: mockTranslations.tMock,
            });
            expect(proposalCreation.term).toMatch(/adminGovernanceSettings.proposalCreation/);
            expect(proposalCreation.definition).toMatch(/adminGovernanceSettings.members/);
            expect(proposalExecution.term).toMatch(/adminGovernanceSettings.proposalExecution/);
            expect(proposalExecution.definition).toMatch(/adminGovernanceSettings.auto/);
        });
    });
});
