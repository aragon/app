import { ProposalStatus } from '@aragon/gov-ui-kit';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { generateProposal } from '@/modules/governance/testUtils';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { workspaceTodoUtils } from './workspaceTodoUtils';

describe('workspaceTodo utils', () => {
    describe('getProposalStatus', () => {
        const getSlotFunctionSpy = jest.spyOn(
            pluginRegistryUtils,
            'getSlotFunction',
        );

        afterEach(() => {
            getSlotFunctionSpy.mockReset();
        });

        it('returns the status computed by the process plugin of the proposal', () => {
            const proposal = generateProposal({
                pluginInterfaceType: PluginInterfaceType.MULTISIG,
            });
            getSlotFunctionSpy.mockReturnValue(() => ProposalStatus.ACTIVE);

            expect(workspaceTodoUtils.getProposalStatus(proposal)).toBe(
                ProposalStatus.ACTIVE,
            );
            expect(getSlotFunctionSpy).toHaveBeenCalledWith({
                slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
                pluginId: PluginInterfaceType.MULTISIG,
            });
        });

        it('returns undefined when no plugin claims the proposal interface type', () => {
            getSlotFunctionSpy.mockReturnValue(undefined);

            expect(
                workspaceTodoUtils.getProposalStatus(generateProposal()),
            ).toBeUndefined();
        });
    });
});
