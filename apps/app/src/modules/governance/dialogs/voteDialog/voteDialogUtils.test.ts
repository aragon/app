import { generateProposal } from '@/modules/governance/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { GovernanceDaoSlotId } from '../../constants/moduleDaoSlots';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { voteDialogUtils } from './voteDialogUtils';

describe('voteDialog utils', () => {
    const getSlotFunctionSpy = jest.spyOn(
        pluginRegistryUtils,
        'getSlotFunction',
    );

    afterEach(() => {
        getSlotFunctionSpy.mockReset();
    });

    describe('buildTransaction', () => {
        it('builds the transaction using the plugin build-vote-data function', async () => {
            const proposal = generateProposal({
                proposalIndex: '2',
                pluginAddress: '0x123',
            });
            const vote = { value: 1 };
            const transactionData = '0xdata';
            const buildDataFunction = jest.fn(() => transactionData);
            getSlotFunctionSpy.mockReturnValue(buildDataFunction);

            const result = await voteDialogUtils.buildTransaction({
                proposal,
                vote,
            });

            expect(getSlotFunctionSpy).toHaveBeenCalledWith({
                pluginId: proposal.pluginInterfaceType,
                slotId: GovernanceSlotId.GOVERNANCE_BUILD_VOTE_DATA,
            });
            expect(buildDataFunction).toHaveBeenCalledWith({
                proposalIndex: proposal.proposalIndex,
                vote,
            });
            expect(result).toEqual({
                to: proposal.pluginAddress,
                data: transactionData,
                value: BigInt(0),
            });
        });

        it('uses the DAO build-vote-data function over the plugin one when registered for the given DAO', async () => {
            const daoId = 'ethereum-sepolia-0x123';
            const proposal = generateProposal();
            const vote = { value: 2 };
            const daoBuildDataFunction = jest.fn(() => '0xdao-data');
            getSlotFunctionSpy.mockReturnValue(daoBuildDataFunction);

            const result = await voteDialogUtils.buildTransaction({
                proposal,
                vote,
                daoId,
            });

            expect(getSlotFunctionSpy).toHaveBeenCalledTimes(1);
            expect(getSlotFunctionSpy).toHaveBeenCalledWith({
                pluginId: daoId,
                slotId: GovernanceDaoSlotId.GOVERNANCE_DAO_BUILD_VOTE_DATA,
            });
            expect(daoBuildDataFunction).toHaveBeenCalledWith({
                proposalIndex: proposal.proposalIndex,
                vote,
            });
            expect(result.data).toEqual('0xdao-data');
        });

        it('falls back to the plugin build-vote-data function when the DAO function does not handle the vote', async () => {
            const daoId = 'ethereum-sepolia-0x123';
            const proposal = generateProposal();
            const vote = { value: 1 };
            const daoBuildDataFunction = jest.fn(() => undefined);
            const buildDataFunction = jest.fn(() => '0xplugin-data');
            getSlotFunctionSpy
                .mockReturnValueOnce(daoBuildDataFunction)
                .mockReturnValueOnce(buildDataFunction);

            const result = await voteDialogUtils.buildTransaction({
                proposal,
                vote,
                daoId,
            });

            expect(daoBuildDataFunction).toHaveBeenCalledWith({
                proposalIndex: proposal.proposalIndex,
                vote,
            });
            expect(getSlotFunctionSpy).toHaveBeenLastCalledWith({
                pluginId: proposal.pluginInterfaceType,
                slotId: GovernanceSlotId.GOVERNANCE_BUILD_VOTE_DATA,
            });
            expect(result.data).toEqual('0xplugin-data');
        });

        it('falls back to the plugin build-vote-data function when no DAO function is registered', async () => {
            const daoId = 'ethereum-sepolia-0x123';
            const proposal = generateProposal();
            const vote = { value: 3 };
            const buildDataFunction = jest.fn(() => '0xplugin-data');
            getSlotFunctionSpy
                .mockReturnValueOnce(undefined)
                .mockReturnValueOnce(buildDataFunction);

            const result = await voteDialogUtils.buildTransaction({
                proposal,
                vote,
                daoId,
            });

            expect(getSlotFunctionSpy).toHaveBeenCalledWith({
                pluginId: daoId,
                slotId: GovernanceDaoSlotId.GOVERNANCE_DAO_BUILD_VOTE_DATA,
            });
            expect(getSlotFunctionSpy).toHaveBeenLastCalledWith({
                pluginId: proposal.pluginInterfaceType,
                slotId: GovernanceSlotId.GOVERNANCE_BUILD_VOTE_DATA,
            });
            expect(result.data).toEqual('0xplugin-data');
        });

        it('uses the target property as transaction target when set', async () => {
            const target = '0x456';
            const proposal = generateProposal({ pluginAddress: '0x123' });
            getSlotFunctionSpy.mockReturnValue(jest.fn(() => '0xdata'));

            const result = await voteDialogUtils.buildTransaction({
                proposal,
                vote: { value: 1 },
                target,
            });

            expect(result.to).toEqual(target);
        });
    });
});
